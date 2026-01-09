# Remotion Automated Lambda

AWS Lambda service for automated video generation using **Remotion Lambda** (official solution).

## Features

- **Generate Slide Video**: Render a single slide to video with TTS narration using Remotion Lambda
- **Concatenate Videos**: Combine multiple videos into one using FFmpeg

## Architecture

This service uses **Remotion Lambda** - Remotion's official AWS Lambda solution:

- Remotion render functions deployed via `@remotion/lambda`
- Your React components bundled and deployed to S3
- API Lambda orchestrates rendering via Remotion Lambda

## Setup (One-Time)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure AWS credentials

Ensure your AWS credentials are configured:

```bash
aws configure
```

### 3. Deploy Remotion Lambda infrastructure

```bash
npm run setup:remotion
```

This will:

- Create an S3 bucket for Remotion
- Deploy Remotion Lambda render function
- Bundle and deploy your React components to S3
- Output configuration variables

### 4. Add environment variables

Create `.env` file with the output from step 3:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# S3 Bucket
S3_BUCKET_NAME=your-bucket-name

# Remotion Lambda Configuration (from setup:remotion output)
REMOTION_APP_REGION=us-east-1
REMOTION_APP_FUNCTION_NAME=remotion-render-{id}
REMOTION_APP_SERVE_URL=https://s3.us-east-1.amazonaws.com/{bucket}/sites/{id}/
```

### 5. Deploy API Lambda

```bash
npm run deploy
# or for production
npm run deploy:prod
```

## Lambda Names

After deployment:

- **API Lambda**: `remotion-video-api-dev-api` (or `-prod-api`)
- **Remotion Render Lambda**: Created by Remotion (shown in setup output)

## Endpoints

### POST /generate-slide

Generate a video from a single slide with text-to-speech narration.

**Request Body:**

```json
{
  "slide": {
    "id": "slide-001",
    "type": "bullets",
    "title": "Slide Title",
    "bullets": ["Point 1", "Point 2", "Point 3"],
    "narration": "This is the narration text for the slide."
  },
  "outputBucket": "your-s3-bucket",
  "outputPrefix": "videos/project-123/",
  "voice": "Ruth"
}
```

**Response:**

```json
{
  "success": true,
  "slideId": "slide-001",
  "audioUrl": "https://bucket.s3.amazonaws.com/audio/slide-001.mp3",
  "videoUrl": "https://bucket.s3.amazonaws.com/videos/slide-001.mp4",
  "duration": 12.5
}
```

### POST /concatenate-videos

Concatenate multiple videos from S3 into a single video.

**Request Body:**

```json
{
  "videoUrls": ["videos/slide-001.mp4", "videos/slide-002.mp4", "videos/slide-003.mp4"],
  "outputBucket": "your-s3-bucket",
  "outputKey": "final/presentation.mp4"
}
```

**Response:**

```json
{
  "success": true,
  "outputUrl": "https://bucket.s3.amazonaws.com/final/presentation.mp4",
  "totalDuration": 45.2,
  "videoCount": 3
}
```

## Development

### Run local tests

**Note:** Local tests won't work until after running `setup:remotion` because they need the Remotion Lambda infrastructure.

```bash
# Test single slide rendering
npm run test:single-slide

# Test video concatenation
npm run test:concatenate
```

## Deployment

```bash
# Deploy to dev stage
make deploy

# Deploy to production
make deploy-prod
```

## Environment Variables

| Variable         | Description                         |
| ---------------- | ----------------------------------- |
| `AWS_REGION`     | AWS region (default: us-east-1)     |
| `S3_BUCKET_NAME` | Default S3 bucket for local testing |

## Slide Types

The `slide.type` field supports:

- `title` - Title slide with optional subtitle
- `bullets` - Bullet points list
- `paragraphs` - Multiple paragraphs
- `image` - Image with caption

## TTS Voices

Uses **AWS Polly** with the **Generative Engine** for natural-sounding speech.

Default voice is `Ruth`. Available English (US) generative voices:

| Voice ID   | Description         |
| ---------- | ------------------- |
| `Ruth`     | US Female (default) |
| `Danielle` | US Female           |
| `Joanna`   | US Female           |
| `Salli`    | US Female           |
| `Matthew`  | US Male             |
| `Stephen`  | US Male             |

Voice can be specified as just the voice ID (e.g., `"Ruth"`) which uses the generative engine by default.

For other engines, use format `"VoiceId:engine"` (e.g., `"Joanna:neural"`).

See [AWS Polly Voices](https://docs.aws.amazon.com/polly/latest/dg/voicelist.html) for full list of available voices and languages.
