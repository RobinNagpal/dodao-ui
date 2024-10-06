# How Image Upload Works
- Our files are stored to S3, as its one of the most reliable and cost-effective storage solutions.
- We can't provide uploading to s3 publically as it can be misused. There needs to be some kind of authentication.
- AWS S3 provides a way to upload files to S3 using a presigned URL.

# Reading
- [Uploading files to S3 using presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Simple Tutorial](https://medium.com/@aidan.hallett/securing-aws-s3-uploads-using-presigned-urls-aa821c13ae8d)

# Image upload process
Image upload is a two-step process:
1. Get a presigned URL from the server. Here we can add user validation and use s3's credentials to get the presigned 
URL which we need to upload the file.
2. Upload the file to S3 using the presigned URL.


# Checklist
- [ ] I understand why the presigned URL is used.
- [ ] I understand the two-step process of image upload.
