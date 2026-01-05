# Remotion Automated Lambda

AWS Lambda service for automated video generation using Remotion.

## Features

- **Generate Slide Video**: Render a single slide to video with TTS narration
- **Concatenate Videos**: Combine multiple videos into one using FFmpeg

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
  "voice": "en-US-JennyNeural"
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

### Install dependencies

```bash
make install
# or
npm install
```

### Run local tests

```bash
# Test single slide rendering
make test-single-slide

# Test video concatenation
make test-concatenate
```

### Invoke locally via Serverless

```bash
# Generate slide
make invoke-generate-slide

# Concatenate videos
make invoke-concatenate

# Test OPTIONS preflight
make invoke-options
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

Default voice is `en-US-JennyNeural`. Other available voices:

- `en-US-GuyNeural`
- `en-US-AriaNeural`
- `en-GB-SoniaNeural`
- `en-AU-NatashaNeural`

See [Edge TTS voices](https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support) for full list.
