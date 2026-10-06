# Database migrations (insights-ui)

How Prisma schema changes get from a PR to the production RDS (`koala_gains_ui_prod`).
Migrations are applied **by CI on merge to `main`** — nobody needs to run anything against
production by hand.

## The flow

| Stage           | Where                                                                                     | What runs                                                                                                                          | Fails when                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR / push       | `.github/workflows/main.yml` → `insights_ui_migrations_check`                             | Throwaway `postgres:16` service: `prisma migrate deploy` of **all** migrations, then `prisma migrate diff` against `schema.prisma` | An existing migration was edited/deleted/renamed; a migration fails to apply; `schema.prisma` has changes with no migration. Destructive SQL in a _new_ migration only **warns**.              |
| Merge to `main` | `.github/workflows/insights-ui-deploy-aws.yml` → `migrate` job (runs **before** `deploy`) | `prisma migrate status` → destructive-SQL guard → `prisma migrate deploy` against prod (`secrets.DATABASE_URL`)                    | A pending migration contains destructive SQL (unless re-run manually with `allow_destructive_migrations`), or `migrate deploy` errors. The image build/rollout never starts if this job fails. |

Why this is safe:

- **`migrate deploy`, never `migrate dev`, in CI.** `deploy` only applies committed migration
  files in order. It never generates SQL, never resets the database, and never prompts.
- **Migrate before rollout.** The new schema lands before the new image is built (the build
  prerenders `/` against the DB) and before it serves traffic. The old container keeps running
  against the new schema for a few minutes, which is fine for additive migrations.
- **Serialized.** The deploy workflow's `concurrency` group means two merges never migrate at the
  same time (Prisma also takes an advisory lock).
- **Destructive SQL needs a human.** `insights-ui/prisma/check-destructive-migrations.sh` flags
  `DROP TABLE/COLUMN/SCHEMA/TYPE`, `TRUNCATE`, `DELETE FROM`, column type changes, and
  column/table renames (SQL comments are ignored). The same script backs the PR warning and the
  deploy gate.

## Writing a migration

1. Point `DATABASE_URL` in `insights-ui/.env` at a **local/dev** database — never production.
   `migrate dev` can offer to reset the database when it detects drift.
2. Edit `prisma/schema.prisma`, then `pnpm prisma migrate dev --name <change>` (or
   `--create-only` to review the SQL first).
3. Commit `schema.prisma` **and** the new `prisma/migrations/<timestamp>_<name>/` folder together.
4. Never edit a migration that is already on `main` — add a new one. CI rejects edits.

### Prefer expand → contract

Old and new code briefly run against the same schema (and Vercel still runs the same app
against the same RDS during the AWS parallel window — see
[aws-migration-plan.md](aws-migration-plan.md)). So:

- **Expand (safe, auto-applied):** add tables, add nullable columns or columns with a default,
  add indexes, add enum values.
- **Contract (destructive, gated):** drop/rename columns or tables, change types. Ship the code
  that stops using the old column first, then drop it in a later PR.

## Expand/contract for destructive changes

The `migrate` job runs **before** the new image is rolled out, so for several minutes the
**old** code serves traffic against the **new** schema. A migration that drops a column or table
the running code still reads breaks production for that whole window: during the deploy of
PR #1763 (credit ledger moved to Stripe) the old code kept querying the dropped columns
between `migrate` and the rollout, and those requests failed for ~14 minutes.

So split any drop/rename the running code depends on into two deploys:

1. **Deploy 1 — stop reading it.** Ship code that no longer reads or writes the columns/tables
   (no migration, or only additive ones).
2. **Deploy 2 — drop it.** Once deploy 1 is fully live, merge the migration that drops them.

If a destructive migration assumes the data is already gone (e.g. dropping a table that should
be empty), make it fail loudly instead of silently deleting rows:

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM old_table) THEN
    RAISE EXCEPTION 'old_table is not empty; migrate the data first';
  END IF;
END $$;

DROP TABLE old_table;
```

`migrate deploy` stops on the exception, nothing is dropped, and the deploy does not roll out.

## Shipping a destructive migration

1. The PR shows a `Destructive SQL in migration …` warning — review the SQL.
2. After merge, the `migrate` job fails with
   `Pending migrations contain destructive SQL` and the deploy does not run.
3. GitHub → Actions → **Deploy insights-ui (AWS / Lightsail)** → **Run workflow** on `main`,
   tick **`allow_destructive_migrations`**. That run applies the migration and deploys.

## When something goes wrong

- **Migration failed half-way** (`migrate deploy` error, P3009 on the next run): fix the data or
  SQL by hand, then mark it with `prisma migrate resolve --applied <name>` or
  `--rolled-back <name>` against prod, and re-run the workflow.
- **Check what prod thinks is applied** (read-only):
  `cd insights-ui && pnpm prisma migrate status` with the prod `DATABASE_URL`.
