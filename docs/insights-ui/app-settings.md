# App Settings (runtime config via SSM Parameter Store)

Some values that used to live in environment variables are really *runtime config*
— behavioural toggles an operator may want to flip without a redeploy. Those are now
managed from the admin **App Settings** screen (`/admin-v1/app-settings`) and stored
in **AWS SSM Parameter Store**, a pay-per-request key/value store with no minimum
commitment (cheap for a handful of keys).

The app **never depends** on SSM being present: if it is not configured, or is
unreachable, values fall back to the legacy env var and then to a bundled default,
so nothing breaks.

## How resolution works

For every managed key, the effective value is resolved in this order:

1. **SSM Parameter Store** — when `APP_CONFIG_SSM_ENABLED=true`.
2. **Legacy `process.env` var** — same key name. A migration convenience; once a
   value lives in SSM you can delete its env var.
3. **Bundled default** — `insights-ui/src/lib/appConfig/appConfigDefaults.json`
   (the "hardcoded config file"), committed to the repo.

The admin screen shows each setting's current value and a badge for where it came
from (**SSM** / **Env var** / **Default**). SSM reads are cached in-process for 60s.

## Code layout

All under `insights-ui/src/lib/appConfig/`:

- `appConfigDefinitions.ts` — the **registry**: which keys exist + how the admin UI
  renders them (label, description, `boolean`/`string`). Single source of truth.
- `appConfigDefaults.json` — fallback values used when SSM has no value and no env
  var is set.
- `ssmParameterStore.ts` — thin AWS SSM wrapper (get-by-path / put). Only touches AWS
  when `APP_CONFIG_SSM_ENABLED=true`.
- `appConfig.ts` — resolver + cache. Public API: `getAppConfigValue`,
  `getAppConfigBoolean`, `getResolvedAppSettings`, `setAppConfigValue`.

Read a setting in server code with `getAppConfigBoolean('KEY')` /
`getAppConfigValue('KEY')` (both async) instead of `process.env.KEY`.

### Adding a new managed setting

1. Add an entry to `APP_CONFIG_DEFINITIONS` in `appConfigDefinitions.ts`.
2. Add its fallback value to `appConfigDefaults.json`.
3. Replace `process.env.KEY` reads with `getAppConfigValue('KEY')` /
   `getAppConfigBoolean('KEY')`.

## Deployment — does it need updating?

**Local dev / Vercel:** nothing to do. Leave `APP_CONFIG_SSM_ENABLED` unset; the app
runs on env vars + defaults exactly as before. The App Settings screen is read-only.

**AWS Lightsail (to actually store settings in SSM):** two changes, no infra rebuild.

1. **Env vars** on the container service:
   - `APP_CONFIG_SSM_ENABLED=true`
   - `APP_CONFIG_SSM_PREFIX=/koalagains/insights-ui/` (optional; this is the default)

   The SSM client reuses the existing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` /
   `AWS_DEFAULT_REGION` already set for S3 and CloudFront — no new credentials.

2. **IAM permissions** — grant the app's IAM identity (the static key the app runs
   with) access to the parameter prefix. Add a statement like:

   ```json
   {
     "Effect": "Allow",
     "Action": ["ssm:GetParametersByPath", "ssm:GetParameter", "ssm:PutParameter"],
     "Resource": "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/koalagains/insights-ui/*"
   }
   ```

   Parameters are stored as plain `String` (these are non-secret toggles), so no KMS
   permission is needed. If a `SecureString` is ever used, also grant `kms:Decrypt`.

Until both are in place the app keeps working on env vars / defaults — the only
missing capability is *saving* from the admin screen, which surfaces a clear message.
