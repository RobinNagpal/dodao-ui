import asyncio
import sqlite3
import uuid
from datetime import datetime, timezone, timedelta
from typing import TypedDict
import json

from fake_useragent import UserAgent
from httpx import HTTPStatusError

from .account import Account
from .db import execute, fetchall, fetchone, log_and_sanitize_query
from .logger import logger
from .login import LoginConfig, login
from .utils import get_env_bool, parse_cookies, utc


class NoAccountError(Exception):
    pass


class AccountInfo(TypedDict):
    username: str
    logged_in: bool
    active: bool
    last_used: datetime | None
    total_req: int
    error_msg: str | None


def guess_delim(line: str):
    lp, rp = tuple([x.strip() for x in line.split("username")])
    return rp[0] if not lp else lp[-1]


class AccountsPool:
    # _order_by: str = "RANDOM()"
    _order_by: str = "username"

    def __init__(
        self,
        db_file="accounts.db",
        login_config: LoginConfig | None = None,
        raise_when_no_account=False,
    ):
        self._db_file = db_file
        self._login_config = login_config or LoginConfig()
        self._raise_when_no_account = raise_when_no_account

    async def load_from_file(self, filepath: str, line_format: str):
        line_delim = guess_delim(line_format)
        tokens = line_format.split(line_delim)

        required = set(["username", "password", "email", "email_password"])
        if not required.issubset(tokens):
            raise ValueError(f"Invalid line format: {line_format}")

        accounts = []
        with open(filepath, "r") as f:
            lines = f.read().split("\n")
            lines = [x.strip() for x in lines if x.strip()]

            for line in lines:
                data = [x.strip() for x in line.split(line_delim)]
                if len(data) < len(tokens):
                    raise ValueError(f"Invalid line: {line}")

                data = data[: len(tokens)]
                vals = {k: v for k, v in zip(tokens, data) if k != "_"}
                accounts.append(vals)

        for x in accounts:
            await self.add_account(**x)

    async def add_account(
        self,
        username: str,
        password: str,
        email: str,
        email_password: str,
        user_agent: str | None = None,
        proxy: str | None = None,
        cookies: str | None = None,
        mfa_code: str | None = None,
    ):
        qs = "SELECT * FROM accounts WHERE username = :username"
        rs = await fetchone(self._db_file, qs, {"username": username})
        if rs:
            logger.warning(f"Account {username} already exists")
            return

        account = Account(
            username=username,
            password=password,
            email=email,
            email_password=email_password,
            user_agent=user_agent or UserAgent().safari,
            active=False,
            locks={},
            stats={},
            headers={},
            cookies=parse_cookies(cookies) if cookies else {},
            proxy=proxy,
            mfa_code=mfa_code,
        )

        if "ct0" in account.cookies:
            account.active = True

        await self.save(account)
        logger.info(f"Account {username} added successfully (active={account.active})")

    async def delete_accounts(self, usernames: str | list[str]):
        usernames = usernames if isinstance(usernames, list) else [usernames]
        usernames = list(set(usernames))
        if not usernames:
            logger.warning("No usernames provided")
            return

        qs = f"""DELETE FROM accounts WHERE username IN ({','.join([f'"{x}"' for x in usernames])})"""
        await execute(self._db_file, qs)

    async def delete_inactive(self):
        qs = "DELETE FROM accounts WHERE active = false"
        qs = log_and_sanitize_query(qs)
        await execute(self._db_file, qs)

    async def get(self, username: str):
        qs = "SELECT * FROM accounts WHERE username = :username"
        rs = await fetchone(self._db_file, qs, {"username": username})
        if not rs:
            raise ValueError(f"Account {username} not found")
        return Account.from_rs(rs)

    async def get_all(self):
        qs = "SELECT * FROM accounts"
        rs = await fetchall(self._db_file, qs)
        return [Account.from_rs(x) for x in rs]

    async def get_account(self, username: str):
        qs = "SELECT * FROM accounts WHERE username = :username"
        print(f"[DEBUG] Database file path: {self._db_file}")

        rs = await fetchone(self._db_file, qs, {"username": username})
        if not rs:
            return None
        return Account.from_rs(rs)

    async def save(self, account: Account):
        data = account.to_rs()
        cols = list(data.keys())

        qs = f"""
        INSERT INTO accounts ({",".join(cols)}) VALUES ({",".join([f":{x}" for x in cols])})
        ON CONFLICT(username) DO UPDATE SET {",".join([f"{x}=excluded.{x}" for x in cols])}
        """
        qs = log_and_sanitize_query(qs)
        await execute(self._db_file, qs, data)

    async def login(self, account: Account):
        try:
            await login(account, cfg=self._login_config)
            logger.info(f"Logged in to {account.username} successfully")
            return True
        except HTTPStatusError as e:
            rep = e.response
            logger.error(f"Failed to login '{account.username}': {rep.status_code} - {rep.text}")
            return False
        except Exception as e:
            logger.error(f"Failed to login '{account.username}': {e}")
            return False
        finally:
            await self.save(account)

    async def login_all(self, usernames: list[str] | None = None):
        if usernames is None:
            qs = "SELECT * FROM accounts WHERE active = false AND error_msg IS NULL"
        else:
            us = ",".join([f'"{x}"' for x in usernames])
            qs = f"SELECT * FROM accounts WHERE username IN ({us})"
            
        qs = log_and_sanitize_query(qs)
        rs = await fetchall(self._db_file, qs)
        accounts = [Account.from_rs(rs) for rs in rs]
        # await asyncio.gather(*[login(x) for x in self.accounts])

        counter = {"total": len(accounts), "success": 0, "failed": 0}
        for i, x in enumerate(accounts, start=1):
            logger.info(f"[{i}/{len(accounts)}] Logging in {x.username} - {x.email}")
            status = await self.login(x)
            counter["success" if status else "failed"] += 1
        return counter

    async def relogin(self, usernames: str | list[str]):
        usernames = usernames if isinstance(usernames, list) else [usernames]
        usernames = list(set(usernames))
        if not usernames:
            logger.warning("No usernames provided")
            return

        # Prepare the SQL query with placeholders
        qs = f"""
        UPDATE accounts SET
            active = false,
            locks = :locks,
            last_used = NULL,
            error_msg = NULL,
            headers = :headers,
            cookies = :cookies,
            user_agent = :user_agent
        WHERE username IN ({','.join([f"'{x}'" for x in usernames])})
        """
        qs = log_and_sanitize_query(qs)
        # Prepare the parameters
        params = {
            "locks": '{}',
            "headers": '{}',
            "cookies": '{}',
            "user_agent": UserAgent().safari
        }

        await execute(self._db_file, qs, params)
        await self.login_all(usernames)

    async def relogin_failed(self):
        qs = "SELECT username FROM accounts WHERE active = false AND error_msg IS NOT NULL"
        qs = log_and_sanitize_query(qs)
        rs = await fetchall(self._db_file, qs)
        await self.relogin([x["username"] for x in rs])

    async def reset_locks(self):
        qs = "UPDATE accounts SET locks = :locks"
        params = {"locks": '{}'}
        qs = log_and_sanitize_query(qs)
        
        await execute(self._db_file, qs, params)

    async def set_active(self, username: str, active: bool):
        qs = "UPDATE accounts SET active = :active WHERE username = :username"
        qs = log_and_sanitize_query(qs)
        
        await execute(self._db_file, qs, {"username": username, "active": active})

    async def lock_until(self, username: str, queue: str, unlock_at: int, req_count=0):
        # Fetch current locks and stats
        qs = "SELECT locks, stats FROM accounts WHERE username = :username"
        qs = log_and_sanitize_query(qs)
        
        rs = await fetchone(self._db_file, qs, {"username": username})
        if not rs:
            raise ValueError(f"Account {username} not found")
        locks_json, stats_json = rs["locks"], rs["stats"]

        # Deserialize JSON strings
        locks = json.loads(locks_json) if locks_json else {}
        stats = json.loads(stats_json) if stats_json else {}

        # Update locks and stats
        unlock_time = datetime.utcfromtimestamp(unlock_at).isoformat()
        locks[queue] = unlock_time
        stats[queue] = stats.get(queue, 0) + req_count

        # Update last_used
        last_used_time = datetime.utcfromtimestamp(utc.ts()).isoformat()

        # Serialize back to JSON
        locks_str = json.dumps(locks)
        stats_str = json.dumps(stats)

        # Update the database
        qs = """
        UPDATE accounts SET
            locks = :locks,
            stats = :stats,
            last_used = :last_used
        WHERE username = :username
        """
        qs = log_and_sanitize_query(qs)
        
        params = {
            "locks": locks_str,
            "stats": stats_str,
            "last_used": last_used_time,
            "username": username
        }
        await execute(self._db_file, qs, params)

    async def unlock(self, username: str, queue: str, req_count=0):
        # Fetch current locks and stats
        qs = "SELECT locks, stats FROM accounts WHERE username = :username"
        qs = log_and_sanitize_query(qs)
        
        rs = await fetchone(self._db_file, qs, {"username": username})
        if not rs:
            raise ValueError(f"Account {username} not found")
        locks_json, stats_json = rs["locks"], rs["stats"]

        # Deserialize JSON strings
        locks = json.loads(locks_json) if locks_json else {}
        stats = json.loads(stats_json) if stats_json else {}

        # Update locks and stats
        locks.pop(queue, None)
        stats[queue] = stats.get(queue, 0) + req_count

        # Update last_used
        last_used_time = datetime.utcfromtimestamp(utc.ts()).isoformat()

        # Serialize back to JSON
        locks_str = json.dumps(locks)
        stats_str = json.dumps(stats)

        # Update the database
        qs = """
        UPDATE accounts SET
            locks = :locks,
            stats = :stats,
            last_used = :last_used
        WHERE username = :username
        """
        qs = log_and_sanitize_query(qs)
        
        params = {
            "locks": locks_str,
            "stats": stats_str,
            "last_used": last_used_time,
            "username": username
        }
        await execute(self._db_file, qs, params)

    async def _get_and_lock(self, queue: str, condition: str):
        # if space in condition, it's a subquery, otherwise it's username
        condition_str = f"({condition})" if " " in condition else f"'{condition}'"

        # Fetch the account(s) matching the condition
        qs = f"SELECT * FROM accounts WHERE username = {condition_str}"
        qs = log_and_sanitize_query(qs)
        
        rs = await fetchone(self._db_file, qs)
        if not rs:
            return None
        account = Account.from_rs(rs)

        # Update locks and last_used
        locks = json.loads(account.locks) if account.locks else {}
        # Set lock for queue to current time + 15 minutes
        unlock_time = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
        locks[queue] = unlock_time

        # Update last_used
        last_used_time = datetime.utcfromtimestamp(utc.ts()).isoformat()

        # Serialize locks back to JSON
        locks_str = json.dumps(locks)

        # Update the account in the database
        qs = """
        UPDATE accounts SET
            locks = :locks,
            last_used = :last_used
        WHERE username = :username
        """
        qs = log_and_sanitize_query(qs)
        
        params = {
            "locks": locks_str,
            "last_used": last_used_time,
            "username": account.username
        }
        await execute(self._db_file, qs, params)

        # Update the account object
        account.locks = locks_str
        account.last_used = last_used_time
        return account

    async def get_for_queue(self, queue: str):
        # Fetch active accounts
        qs = f"SELECT * FROM accounts WHERE active = true ORDER BY {self._order_by}"
        qs = log_and_sanitize_query(qs)
        
        rs_list = await fetchall(self._db_file, qs)
        for rs in rs_list:
            account = Account.from_rs(rs)
            # Check locks
            locks = json.loads(account.locks) if account.locks else {}
            lock_time_str = locks.get(queue)
            if lock_time_str:
                lock_time = datetime.fromisoformat(lock_time_str)
                now = datetime.utcnow()
                if lock_time > now:
                    # Account is locked for this queue
                    continue
            # Account is available
            return await self._get_and_lock(queue, account.username)
        # No available account found
        return None

    async def get_for_queue_or_wait(self, queue: str) -> Account | None:
        msg_shown = False
        while True:
            account = await self.get_for_queue(queue)
            if not account:
                if self._raise_when_no_account or get_env_bool("TWS_RAISE_WHEN_NO_ACCOUNT"):
                    raise NoAccountError(f"No account available for queue {queue}")

                if not msg_shown:
                    nat = await self.next_available_at(queue)
                    if not nat:
                        logger.warning("No active accounts. Stopping...")
                        return None

                    msg = f'No account available for queue "{queue}". Next available at {nat}'
                    logger.info(msg)
                    msg_shown = True

                await asyncio.sleep(5)
                continue
            else:
                if msg_shown:
                    logger.info(f"Continuing with account {account.username} on queue {queue}")

            return account

    async def next_available_at(self, queue: str):
        # Fetch all active accounts
        qs = "SELECT locks FROM accounts WHERE active = true"
        qs = log_and_sanitize_query(qs)
        
        rs_list = await fetchall(self._db_file, qs)
        earliest_lock_time = None
        for rs in rs_list:
            locks_json = rs["locks"]
            locks = json.loads(locks_json) if locks_json else {}
            lock_time_str = locks.get(queue)
            if lock_time_str:
                lock_time = datetime.fromisoformat(lock_time_str)
                if earliest_lock_time is None or lock_time < earliest_lock_time:
                    earliest_lock_time = lock_time
        if earliest_lock_time:
            now = datetime.utcnow()
            if earliest_lock_time < now:
                return "now"
            at_local = datetime.now() + (earliest_lock_time - now)
            return at_local.strftime("%H:%M:%S")
        return None

    async def mark_inactive(self, username: str, error_msg: str | None):
        qs = """
        UPDATE accounts SET active = false, error_msg = :error_msg
        WHERE username = :username
        """
        qs = log_and_sanitize_query(qs)
        
        await execute(self._db_file, qs, {"username": username, "error_msg": error_msg})

    async def stats(self):
        # Fetch all locks
        qs = "SELECT locks FROM accounts"
        rs_list = await fetchall(self._db_file, qs)
        gql_ops_set = set()
        locks_counts = {}

        for rs in rs_list:
            locks_json = rs["locks"]
            locks = json.loads(locks_json) if locks_json else {}
            for k in locks.keys():
                gql_ops_set.add(k)

        gql_ops = list(gql_ops_set)

        # Count total, active, inactive accounts
        qs = "SELECT COUNT(*) as total, SUM(CASE WHEN active THEN 1 ELSE 0 END) as active FROM accounts"
        qs = log_and_sanitize_query(qs)
        
        rs = await fetchone(self._db_file, qs)
        total_accounts = rs["total"]
        active_accounts = rs["active"]
        inactive_accounts = total_accounts - active_accounts

        # Count locked accounts for each queue
        locks_counts = {f"locked_{queue}": 0 for queue in gql_ops}
        qs = "SELECT active, locks FROM accounts"
        qs = log_and_sanitize_query(qs)
        
        rs_list = await fetchall(self._db_file, qs)
        now = datetime.utcnow()
        for rs in rs_list:
            active = rs["active"]
            if not active:
                continue
            locks_json = rs["locks"]
            locks = json.loads(locks_json) if locks_json else {}
            for queue in gql_ops:
                lock_time_str = locks.get(queue)
                if lock_time_str:
                    lock_time = datetime.fromisoformat(lock_time_str)
                    if lock_time > now:
                        locks_counts[f"locked_{queue}"] += 1

        # Build the stats dictionary
        stats_dict = {
            "total": total_accounts,
            "active": active_accounts,
            "inactive": inactive_accounts,
        }
        stats_dict.update(locks_counts)
        return stats_dict

    async def accounts_info(self):
        accounts = await self.get_all()

        items: list[AccountInfo] = []
        for x in accounts:
            item: AccountInfo = {
                "username": x.username,
                "logged_in": (x.headers or {}).get("authorization", "") != "",
                "active": x.active,
                "last_used": x.last_used,
                "total_req": sum(x.stats.values()),
                "error_msg": str(x.error_msg)[0:60],
            }
            items.append(item)

        old_time = datetime(1970, 1, 1).replace(tzinfo=timezone.utc)
        items = sorted(items, key=lambda x: x["username"].lower())
        items = sorted(
            items,
            key=lambda x: x["last_used"] or old_time if x["total_req"] > 0 else old_time,
            reverse=True,
        )
        items = sorted(items, key=lambda x: x["active"], reverse=True)
        # items = sorted(items, key=lambda x: x["total_req"], reverse=True)
        return items
