# How Image Upload Works

- Files are stored on S3.
- Direct public uploads are not allowed — every upload is gated by an authenticated server step that issues an S3 **presigned URL**.

## Two-step upload flow

1. Client requests a presigned URL from our server. The server runs auth/validation and uses S3 credentials to mint a short-lived URL scoped to a single object.
2. Client `PUT`s the file directly to S3 using that presigned URL.
