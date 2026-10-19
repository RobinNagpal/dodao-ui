# academy-ui and simulations on the shared Lightsail host

`academy-ui` (TidbitsHub) and `simulations` used to run on Vercel. They now run as Next.js
standalone servers on the **shared Lightsail host** that courtpot and interestled already use —
one Ubuntu 24.04 box (4 GB, 2 vCPU), Caddy terminating TLS per hostname, one systemd service per
application on its own loopback port. The host itself is defined in
[RobinNagpal/courtpot `deployment/terraform/shared-host`](https://github.com/RobinNagpal/courtpot/tree/main/deployment/terraform/shared-host)
(its `deployment/README.md` is the host's runbook); this folder holds the dodao-ui half.

```
                         shared Lightsail host (static IP)
                         ┌───────────────────────────────────────────────────────┐
tidbitshub.org        ──▶│ Caddy :443  tidbitshub.org             → 127.0.0.1:7073 │
www.tidbitshub.org    ──▶│             www.tidbitshub.org  → 308 https://tidbitshub.org{uri}
<space>.tidbitshub.org──▶│             *.tidbitshub.org (on-demand TLS) → :7073    │
simulations.          ──▶│             simulations.koalagains.com → 127.0.0.1:7074 │
  koalagains.com         │                                                       │
                         │ systemd  academy-ui-api   node /srv/academy-ui/current/index.js   │
                         │ systemd  simulations-api  node /srv/simulations/current/index.js  │
                         │ (+ courtpot-api :7071, interestled-api :7072)          │
                         └───────────────────────────────────────────────────────┘
```

| App | Port | Hosts | Service | Env file | Secrets Manager |
|---|---|---|---|---|---|
| academy-ui | 7073 | `tidbitshub.org`, `www.` (308 → apex), `*.tidbitshub.org` | `academy-ui-api` | `/etc/academy-ui-api.env` | `academy-ui/app-env` |
| simulations | 7074 | `simulations.koalagains.com` | `simulations-api` | `/etc/simulations-api.env` | `simulations/app-env` |

- **No CloudFront.** DNS points straight at the host's static IP and Caddy serves everything,
  static assets included (`encode zstd gzip`). Caddy passes the original `Host` and sets
  `X-Forwarded-Proto`/`-Host`, which academy-ui relies on to resolve the space and next-auth
  relies on for its URLs.
- **`www.tidbitshub.org` redirects to the apex.** academy-ui resolves the space from the Host
  header, and `www` would resolve to a space with id `www` (there is none), so serving it would
  render "no space".
- **`<space>.tidbitshub.org`** gets a certificate on its first visit (Caddy on-demand TLS). Caddy
  asks itself — a loopback-only endpoint in its own config — and approves exactly one DNS label
  under `tidbitshub.org`; nothing else gets a certificate. See courtpot's README, "Optional
  per-application settings".
- **No database writes, ever, from deploys.** The workflows run no migrations and the builds never
  see `DATABASE_URL`. Schema changes for these apps are applied by hand as before.

## Files

| File | What |
|---|---|
| `build-app.sh <app>` | `pnpm --filter <app> build` with the build-time env (below), then `build-bundle.sh`. |
| `build-bundle.sh <app>` | Turns `<app>/.next/standalone` into `dist/<app>/`: copies `.next/static` and `public/` in, checks the Ubuntu 24.04 Prisma engine (`debian-openssl-3.0.x`) is present and no symlink is absolute, writes `index.js`. |
| `ship.sh` | rsync → `/srv/<app>/next` (hard-linking unchanged files from `current`), write `/etc/<app>-api.env`, swap `next` → `current` (old one kept as `previous`), restart, verify. |
| `terraform/` | Route 53: `simulations.koalagains.com` A record, and a new `tidbitshub.org` zone. |
| `.github/workflows/academy-ui-deploy-shared-host.yml`, `simulations-deploy-shared-host.yml` | One workflow per app. |

`dist/<app>/index.js` is what systemd runs. It binds the standalone server to `127.0.0.1` (Caddy
is the only client), sets `KEEP_ALIVE_TIMEOUT` above Caddy's upstream idle timeout, `chdir`s into
`<app>/` and requires `<app>/server.js`. `PORT` and `NODE_OPTIONS` (heap cap) come from the unit.

## Every deploy

Push to `main` touching `<app>/**`, `shared/web-core/**`, these scripts or the workflow — or run
the workflow by hand (**Actions → Deploy … (shared Lightsail host) → Run workflow**). In the runner:

1. `pnpm install --frozen-lockfile --filter <app>...` (pnpm 11, Node 22);
2. read the app's Secrets Manager JSON (values masked in the log);
3. build with `NEXT_PUBLIC_VERCEL_URL=<public host>`, `NEXT_PUBLIC_VERCEL_ENV=production`, every
   `NEXT_PUBLIC_*` key from the secret, and — academy-ui only — `V2_API_SERVER_URL` and
   `DODAO_SUPERADMINS`, which its `next.config.mjs` `env` block inlines into the bundle (so a change
   to either needs a redeploy, not just an env edit). `DATABASE_URL` is explicitly unset: neither
   build prerenders anything from the database;
4. `ship.sh`: rsync, env file, swap, `sudo systemctl restart <app>-api`;
5. poll `http://127.0.0.1:<port>/api/health` **on the host** (hard gate; dumps the journal on
   failure), then `https://<public host>/api/health` **through Caddy**, pinned to the host's IP.
   That second check is a warning, not a failure, while DNS for the host still points elsewhere —
   Caddy cannot hold a certificate for a name before DNS reaches it.

`/api/health` is a static `{"status":"ok"}` in each app; it does not touch the database.

The workflows are skipped (not failed) until the `DEPLOY_HOST` variable exists, so merging before
setup leaves `main` green.

### Runtime environment

`/etc/<app>-api.env` is rewritten on every deploy from the secret — every key, double-quoted for
systemd — followed by fixed lines from the workflow that always win:

| Fixed key | Why |
|---|---|
| `VERCEL_ENV=production` | web-core's `getAuthOptions` only sets the `Secure` session cookie and its `COOKIE_DOMAIN` when this is `production`. On Vercel it was a system variable. |
| `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_ENV` | Same values the bundle was built with, for server code that reads them at runtime. |
| `AUTH_TRUST_HOST=true` | next-auth derives its origin from the forwarded Host only when `VERCEL` or this is set; otherwise it uses `NEXTAUTH_URL` for every host, which breaks `<space>.tidbitshub.org` sign-in. |

The unit adds `NODE_ENV=production`, `PORT`, and `NODE_OPTIONS=--max-old-space-size` (768 MB
academy-ui, 512 MB simulations) with a cgroup `MemoryMax` of 1200M / 900M.

## Secrets Manager: the env JSON each app needs

One secret per app, a flat JSON object of `KEY → value` (like `insights-ui/app-env`). Copy the
values from the Vercel project settings (Environment Variables, Production). Do **not** put
`VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_ENV`, `AUTH_TRUST_HOST`, `PORT`,
`NODE_ENV` or `NODE_OPTIONS` in them — the workflow and unit own those.

**`academy-ui/app-env`**

| Key | Needed for |
|---|---|
| `DATABASE_URL` | Prisma — the existing RDS, unchanged. |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (`https://tidbitshub.org`) | next-auth. With `AUTH_TRUST_HOST` the per-request origin wins; `NEXTAUTH_URL` is the server-side fallback. |
| `DODAO_AUTH_SECRET`, `EMAIL_TOKEN_SECRET` | dodao access tokens; email-login tokens. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | SES (login emails from `support@tidbitshub.org`) and S3 uploads. The host has no instance role, so the keys must be here. |
| `DEFAULT_REGION`, `PUBLIC_AWS_S3_BUCKET` | S3 uploads / presigned URLs. |
| `DODAO_SUPERADMINS`, `V2_API_SERVER_URL` | **Build-time** (inlined by `next.config.mjs`) and runtime. |
| `DODAO_DEFAULT_SPACE_ID` | Space for `localhost` / `*.vercel.app` hosts (fallback). |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `DISCORD_CLIENT_ID`/`_SECRET`, `TWITTER_CLIENT_ID`/`_SECRET` | OAuth providers (web-core). |
| `COOKIE_DOMAIN` *(optional)* | Defaults to `.tidbitshub.org` — one session across the apex and every space subdomain. Leave unset. |
| `OPENAI_API_KEY` | AI features. |
| `SERVER_ERRORS_WEBHOOK`, `ALL_GUIDE_SUBMISSIONS_WEBHOOK`, `SNAPSHOT_URI`, `VITE_DISCORD_CLIENT_ID` | Discord notifications. |
| `NEXT_PUBLIC_UNSPLASH_API_KEY`, `NEXT_PUBLIC_DODAO_ACCESS_TOKEN_KEY_SUFFIX` | **Build-time** (any `NEXT_PUBLIC_*` in the secret is passed to the build). |

**`simulations/app-env`**

| Key | Needed for |
|---|---|
| `DATABASE_URL` | Prisma — the existing RDS, unchanged. |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (`https://simulations.koalagains.com`) | next-auth. |
| `DODAO_AUTH_SECRET`, `EMAIL_TOKEN_SECRET` | dodao access tokens; email-login tokens. |
| `COOKIE_DOMAIN` | **Required: `simulations.koalagains.com`.** web-core falls back to `.tidbitshub.org`, which a browser on koalagains.com rejects — login would silently fail. Not `.koalagains.com` either: that would collide with insights-ui's `next-auth.session-token` on koalagains.com. |
| `GOOGLE_API_KEY` | Gemini (primary LLM). |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | SES (login emails from `contact@koalagains.com`) and the Bedrock fallback model. |
| `GOOGLE_CLIENT_ID`/`_SECRET`, `DISCORD_CLIENT_ID`/`_SECRET`, `TWITTER_CLIENT_ID`/`_SECRET` | Only if those sign-in buttons are used (web-core registers the providers). |
| `DODAO_SUPERADMINS`, `SERVER_ERRORS_WEBHOOK` | Superadmin check; error webhook (optional). |

**OAuth redirect URIs**: the hostnames do not change, so the callbacks registered for Vercel stay
valid — `https://tidbitshub.org/api/auth/callback/{google,discord,twitter}` (plus any
`https://<space>.tidbitshub.org/api/auth/callback/<provider>` that were registered; Google does not
accept wildcards) and `https://simulations.koalagains.com/api/auth/callback/<provider>`. Check they
exist in each provider's console; nothing new is required.

## One-time setup (in this order)

Nothing below has been applied yet. AWS and SSH steps run with your credentials.

**1. Host: add the two apps.** Merge the courtpot PR, then re-run `provision.sh` over SSH exactly as
its `deployment/README.md` → "Adding an application" shows (copy the new script to
`/root/provision.sh`, run it as root with the four-app `APPS_JSON`). It creates the units, sudo
rules, env files, `/srv/<app>` and the Caddy sites, adds a 2 GB swap file, and **reloads** Caddy —
courtpot and interestled keep serving. Do not `terraform apply` the shared-host stack for this.
Until DNS moves, Caddy logs failed certificate attempts for the new names and retries with
backoff; that is expected.

**2. Secrets Manager** (us-east-1): create `academy-ui/app-env` and `simulations/app-env` with the
keys above.

**3. IAM**: the user behind dodao-ui's `AWS_ACCESS_KEY_ID` secret needs
`secretsmanager:GetSecretValue` on `arn:aws:secretsmanager:us-east-1:<account>:secret:academy-ui/app-env-*`
and `…:secret:simulations/app-env-*` (it already reads `insights-ui/app-env`).

**4. GitHub** (dodao-ui → Settings → Secrets and variables → Actions):

| Kind | Name | Value |
|---|---|---|
| Secret | `SSH_PRIVATE_KEY` | courtpot `deployment/terraform/shared-host`: `terraform output -raw deploy_private_key` (same key courtpot's repo has) |
| Variable | `DEPLOY_HOST` | the static IP: `terraform output -raw static_ip` there |
| Variable | `SSH_HOST_KEY` | `ssh-keyscan -t rsa,ecdsa,ed25519 <static-ip>` (pinned; update it if the instance is ever recreated) |

**5. First deploys**: run both workflows by hand. Each should end with "serving on 127.0.0.1:<port>"
and a warning that DNS has not been switched.

**6. DNS — simulations.koalagains.com.** The koalagains.com zone holds a hand-made CNAME
`simulations.koalagains.com → <id>.vercel-dns-016.com`, which Route 53 will not let an A record sit
beside. Delete it, then apply (the site is already down on Vercel, so the gap costs nothing):

```sh
ZONE=$(aws route53 list-hosted-zones-by-name --dns-name koalagains.com \
  --query 'HostedZones[0].Id' --output text)
RR=$(aws route53 list-resource-record-sets --hosted-zone-id "$ZONE" \
  --query "ResourceRecordSets[?Name=='simulations.koalagains.com.' && Type=='CNAME'] | [0]" --output json)
echo "$RR"   # check it is the Vercel CNAME
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE" \
  --change-batch "$(jq -n --argjson rr "$RR" '{Changes: [{Action: "DELETE", ResourceRecordSet: $rr}]}')"
```

**7. Terraform** (`deployments/shared-host-apps/terraform`, state in `koalagains-terraform-state`):

```sh
cd deployments/shared-host-apps/terraform
terraform init
terraform apply -var shared_host_state_bucket=shared-host-tfstate-<account-id>
terraform output tidbitshub_name_servers
```

If the shared-host state bucket is in an account these credentials cannot read, pass
`-var static_ip=<ip>` instead of `shared_host_state_bucket`.

This creates the simulations A record (live immediately — Caddy gets its certificate on the next
request) and adds apex, `www` and `*` A records plus CAA (`letsencrypt.org`, `sectigo.com`) to the
**existing** `tidbitshub.org` hosted zone. That zone was created earlier by hand and already holds
the Google Workspace MX, the site-verification TXT, `_dmarc` and the three SES Easy DKIM CNAMEs, so
nothing needs copying from Vercel. It answers nobody until step 8.

The Vercel DNS zone (dig, 2026-10-15) had only A records (apex/www/wildcard) and CAA: **no MX**, so
mail to `@tidbitshub.org` is not being delivered today. Switching the nameservers restores it.

**8. Registrar: switch tidbitshub.org's nameservers** from `ns1/ns2.vercel-dns.com` to the four in
`tidbitshub_name_servers`. Propagation can take up to the parent zone's NS TTL (often 1–2 days for
`.org`); both old and new answers may be seen meanwhile, and the old ones lead to Vercel's 451.

**9. Verify** once DNS resolves to the host: re-run both workflows (the public check is now
enforced), then

```sh
curl -sSI https://tidbitshub.org/api/health
curl -sSI https://www.tidbitshub.org/some/path     # 308 → https://tidbitshub.org/some/path
curl -sSI https://alchemix.tidbitshub.org/          # first hit obtains the certificate (a few s)
curl -sSI https://simulations.koalagains.com/api/health
```

and sign in on each (email login exercises SES; Google exercises OAuth).

## Operating

```sh
ssh -i ~/.ssh/shared-apps.pem ubuntu@<static-ip>
sudo journalctl -u academy-ui-api -f        # or simulations-api
sudo journalctl -u caddy -f                 # TLS, on-demand certificates, routing
curl localhost:7073/api/health              # the app, bypassing Caddy
systemctl status academy-ui-api             # memory use vs MemoryMax
```

**Rollback** to the previous bundle (kept by every deploy), as the `deploy` user:

```sh
cd /srv/academy-ui && mv current failed && mv previous current && sudo systemctl restart academy-ui-api
```

The env file is not rolled back; restore the old secret value and re-run the workflow if that was
the change.

**Memory.** 4 GB shared, plus 2 GB swap. Typical: OS + Caddy ~0.5 GB, courtpot and interestled
~0.1–0.2 GB each, academy-ui ~0.3–0.6 GB, simulations ~0.2–0.4 GB — about 1.5 GB. Ceilings (cgroup
`MemoryMax`) are 1.2 GB and 0.9 GB, so even both Next apps at their limit stay under ~3 GB; past a
ceiling the kernel kills only that service and systemd restarts it in 3 s.

## Known gaps

- **Spaces with their own custom domains** (a `Space.domains` entry outside tidbitshub.org) are not
  served: Caddy has no site for them and DNS for them is not here. Each one needs an A record (at
  whoever hosts that domain's DNS) to the host and a Caddy site proxying to 7073 — the shared-host
  `apps` map has no "extra served hosts" field yet, so that is a small provision.sh addition. Check
  whether any exist (read-only):
  `SELECT id, domains FROM spaces WHERE cardinality(domains) > 0;`.
- **Self-fetch.** academy-ui server components call `https://tidbitshub.org/api/spaces?...` (built
  from `NEXT_PUBLIC_VERCEL_URL`), i.e. the host calls itself through its public IP and Caddy. AWS
  hairpins that fine; if it ever does not, an `/etc/hosts` line `127.0.0.1 tidbitshub.org` on the host
  routes it to the local Caddy with the same certificate.
- **Native helpers.** academy-ui's `pdf-image` (PDF → image) shells out to ImageMagick/poppler,
  which the host does not have. Install them on the host (`apt-get install imagemagick
  poppler-utils`) only if that feature is still used.
- **Vercel-only bits** that are now inert: `@vercel/analytics` (its script 404s; harmless) and the
  `vercel.json` headers (`next.config` already sets the same CORS headers).
