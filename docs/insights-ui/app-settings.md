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

## Deployment

**Local dev / Vercel:** nothing to do. Leave `APP_CONFIG_SSM_ENABLED` unset; the app
runs on env vars + defaults exactly as before, and the App Settings screen is read-only.

**AWS Lightsail:** wired in the `deployments/insights-ui/` Terraform — two changes, no
infra rebuild, both applied by a normal `terraform apply` + redeploy:

1. **Env vars** (`variables.tf`, `app_env`):
   - `APP_CONFIG_SSM_ENABLED = "true"`
   - `APP_CONFIG_SSM_PREFIX  = "/koalagains/insights-ui/"`

   The SSM client reuses the same env-var AWS credentials already used for S3 and
   CloudFront — no new credentials. Enabling SSM is safe on its own: until a key is
   actually set in SSM, each value still resolves to its `app_env` var, so behaviour
   is unchanged. (The two migrated toggles remain in `app_env` as their fallback.)

2. **IAM** (`cloudfront.tf`, `aws_iam_policy.insights_ui_project_policy`): the app's
   runtime identity gets `ssm:GetParametersByPath` / `GetParameter` / `GetParameters`
   (reads) and `ssm:PutParameter` (saving edits from the admin screen), scoped to
   `arn:aws:ssm:<region>:<account>:parameter/koalagains/insights-ui/*`. This is the
   same policy that already grants the app CloudFront-invalidation rights. Parameters
   are plain `String` (non-secret toggles), so no KMS permission is needed; if a
   `SecureString` is ever introduced, also grant `kms:Decrypt`.

   > IAM note: this policy is attached to the `insights-ui-vercel-project` IAM user —
   > the identity whose access keys back the app's working CloudFront invalidation
   > today. If the deployed app is ever switched to a different `KOALA_AWS_*` IAM user,
   > the same SSM statement must move to that user, otherwise saves will 403.

Keep the prefix in `APP_CONFIG_SSM_PREFIX` and the IAM `Resource` ARN in sync.
