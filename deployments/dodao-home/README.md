# dodao-home — dodao.io on S3 + CloudFront

dodao.io is a **purely static** site: the `dodao-home` Next.js app is built with
`output: 'export'` and the resulting `out/` folder is served from a private S3 bucket through
CloudFront. No server, no API, no database.

```
browser ──► CloudFront (dodao.io, www.dodao.io)
              │  viewer-request function: www → apex 301, /x/ → /x 301, /x → /x.html
              │  403/404 → /404.html (status 404)
              └──► S3 (private, Origin Access Control)  ◄── GitHub Actions deployer (sync + invalidate)
```

## Files

| File | What |
|---|---|
| `versions.tf` | Terraform/provider versions, S3 remote state (`key = dodao-home/terraform.tfstate`, bucket via `-backend-config`) |
| `providers.tf` | Default region + the `us_east_1` alias for the ACM certificate |
| `s3.tf` | Private bucket `dodao-home-web-<account-id>` readable only by this distribution |
| `cloudfront.tf` | OAC, viewer-request function, security headers, distribution, custom 404 |
| `functions/viewer-request.js.tftpl` | The CloudFront Function (www redirect + clean-URL rewrite) |
| `acm.tf` | Certificate for `dodao.io` + `www.dodao.io` (us-east-1), DNS-validated in the **existing** zone |
| `dns.tf` | A/AAAA alias records for the apex and `www` → CloudFront |
| `iam-deployer.tf` | `dodao-home-deployer` IAM user: sync this bucket + invalidate this distribution only |
| `outputs.tf` | Values to copy into GitHub (below) |

The Route 53 hosted zone for `dodao.io` is only **read** (`data "aws_route53_zone"`); this stack
never creates or deletes the zone, and only manages the records listed above.

## One-time setup

Run from this directory with admin credentials for the AWS account that owns the `dodao.io`
hosted zone.

1. **State bucket** (skip if you already have one for other stacks — any private, versioned,
   encrypted bucket works; the state contains the deployer's secret key):

   ```bash
   aws s3api create-bucket --bucket dodao-home-tfstate-<account-id> --region us-east-1
   aws s3api put-bucket-versioning --bucket dodao-home-tfstate-<account-id> --versioning-configuration Status=Enabled
   aws s3api put-bucket-encryption --bucket dodao-home-tfstate-<account-id> \
     --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
   aws s3api put-public-access-block --bucket dodao-home-tfstate-<account-id> \
     --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
   ```

2. **Init**

   ```bash
   terraform init -backend-config="bucket=dodao-home-tfstate-<account-id>"
   ```

3. **Create everything except the DNS cut-over** (bucket, certificate + its validation records,
   distribution, function, deployer user). dodao.io keeps pointing wherever it points today:

   ```bash
   terraform apply \
     -target=aws_acm_certificate_validation.web \
     -target=aws_cloudfront_distribution.web \
     -target=aws_s3_bucket_policy.web \
     -target=aws_s3_bucket_ownership_controls.web \
     -target=aws_iam_user_policy.deployer \
     -target=aws_iam_access_key.deployer
   ```

4. **Configure GitHub** (repo → Settings → Secrets and variables → Actions):

   | Kind | Name | Value |
   |---|---|---|
   | Secret | `DODAO_HOME_AWS_ACCESS_KEY_ID` | `terraform output -raw deployer_access_key_id` |
   | Secret | `DODAO_HOME_AWS_SECRET_ACCESS_KEY` | `terraform output -raw deployer_secret_access_key` (pipe straight into `gh secret set`, don't echo it) |
   | Variable | `DODAO_HOME_S3_BUCKET` | `terraform output -raw web_bucket` |
   | Variable | `DODAO_HOME_CLOUDFRONT_DISTRIBUTION_ID` | `terraform output -raw cloudfront_distribution_id` |

   ```bash
   terraform output -raw deployer_access_key_id      | gh secret set DODAO_HOME_AWS_ACCESS_KEY_ID
   terraform output -raw deployer_secret_access_key  | gh secret set DODAO_HOME_AWS_SECRET_ACCESS_KEY
   gh variable set DODAO_HOME_S3_BUCKET --body "$(terraform output -raw web_bucket)"
   gh variable set DODAO_HOME_CLOUDFRONT_DISTRIBUTION_ID --body "$(terraform output -raw cloudfront_distribution_id)"
   ```

5. **First deploy**: run the **Deploy dodao-home** workflow
   (`gh workflow run dodao-home-deploy.yml`), then check the site on the distribution's own
   hostname before switching DNS. The distribution only answers for its aliases, so test with
   the Host header:

   ```bash
   CF=$(terraform output -raw cloudfront_domain_name)
   curl -sI --compressed --resolve dodao.io:443:$(dig +short "$CF" | head -1) https://dodao.io/robotics
   ```

6. **DNS cut-over** — point `dodao.io` and `www.dodao.io` at CloudFront. Check the current
   records first; Route 53 can overwrite an `A` record in place (`allow_overwrite`) but cannot
   turn a `CNAME` into an `A` alias, so delete an existing `www` CNAME (or apex/`www` records
   of other types that would conflict) in the console first:

   ```bash
   aws route53 list-resource-record-sets --hosted-zone-id "$(aws route53 list-hosted-zones-by-name \
     --dns-name dodao.io --query 'HostedZones[0].Id' --output text)" \
     --query "ResourceRecordSets[?Name=='dodao.io.' || Name=='www.dodao.io.']"
   terraform apply
   ```

7. Remove `dodao.io` / `www.dodao.io` from the old Vercel project's domains (once Vercel is
   reachable again) so it doesn't fight for the certificate.

## Deploys

`.github/workflows/dodao-home-deploy.yml` runs on every push to `main` touching `dodao-home/**`
or `shared/web-core/**` (and manually). It builds the export, syncs `/_next/static` with
`Cache-Control: public,max-age=31536000,immutable`, syncs everything else with
`--delete` and a 5-minute cache, then invalidates `/*`. CI never runs Terraform.

Local preview of the export: `pnpm --filter dodao-home build && pnpm --filter dodao-home serve`
(note: `serve` maps `/x` → `/x.html` like the CloudFront function does).
