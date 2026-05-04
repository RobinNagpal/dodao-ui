# tariff-candidate-codes

Tiny pass-through AWS Lambda + API Gateway in front of the public
`tariffs.flexport.com` candidate-codes endpoint. Lets the local bulk-SQL
generator (`yarn tariffs:gen-candidate-codes-sql` in `insights-ui`) sidestep
the per-source-IP daily quota by routing each parallel fetch through a
separate Lambda execution environment — each cold container has its own AWS
egress IP.

## Why

Direct calls from a single workstation IP burn the upstream quota after
~2 chapters' worth of HTS10 codes (78+ failures with HTTP 429 / 403
`{"error":"Usage limit exceeded"}`). The upstream rate limit is enforced
per-IP at CloudFront, so a wider pool of egress IPs resets the counter for
each one. AWS Lambda gives us that pool for free: concurrent invocations land
on different containers with different IPs.

## What it does

The path mirrors the upstream URL (`/api/public/v1/candidate-codes/{hts10}`)
so the local script can switch over by simply pointing
`TARIFF_CANDIDATE_CODES_BASE_URL` at this API Gateway URL — no schema or
content-type changes downstream.

The handler:

1. Validates `hts10` matches `/^\d{10}$/`. Bad input → 400.
2. Forwards a browser-shaped request to upstream (matching User-Agent +
   Referer + Origin headers; non-browser UAs get 403 instead of 429 from
   upstream).
3. Returns upstream's status code, content-type, and body unchanged. The
   429/403 + `Usage limit exceeded` JSON body propagates through, so the
   local script's existing `RATE_LIMITED:` detection still fires correctly.
4. Network/transport failures upstream return 502 with a JSON error body.

## Deploy

From the `lambdas/` parent dir:

```bash
make deploy-tariff-candidate-codes
```

or directly:

```bash
cd lambdas/tariff-candidate-codes
npx serverless deploy
```

After the first deploy, copy the `endpoint:` URL printed by Serverless and
paste it into your `insights-ui/.env` as:

```
TARIFF_CANDIDATE_CODES_LAMBDA_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

Then run the bulk SQL generator with `--via-lambda`:

```bash
cd insights-ui
yarn tariffs:gen-candidate-codes-sql --chapter 4 --via-lambda
```

## Cost

A full pass over all ~99 HTSUS chapters (~10k HTS10 codes worst case):

- Invocations: 10k × $0.20 / 1M = **~$0.002**
- Compute: 10k × ~700ms × 128 MB ≈ ~900 GB-s × $0.0000166 = **~$0.015**
- API Gateway: 10k requests × $1.00 / 1M = **~$0.01**

Well within the AWS free tier (1M Lambda invokes + 400k GB-s + 1M HTTP API
requests per month).

## Caveats

- All Lambda IPs in a region share the same AS (AS16509 — Amazon). If
  upstream ever switches from per-IP to per-ASN throttling, this whole pool
  collapses to one bucket. Mitigation if/when that happens: deploy the same
  Lambda to multiple regions and have the local script round-robin region
  prefixes in the URL.
- Concurrent cold starts get distinct IPs; a *warm* container reuses its IP.
  The local script bumps concurrency when `--via-lambda` is set so we always
  fan out to fresh containers.
