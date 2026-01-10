# Remotion Automated API

## S3 File Structure

**Direct Storage (text, audio script, audio, metadata):**

```
{presentation-id}/
├── inputs/
│   ├── slide-and-script-preferences.json  # User's slide content + narration
│   └── prompt.txt                          # Original prompt (if AI-generated)
├── middle/
│   └── generated-slide-content-all.json    # AI-generated content
└── output/
    ├── 01-slide/
    │   ├── generated-slide-text.json       # Slide content
    │   ├── generated-slide-audio-script.txt # Narration text
    │   ├── generated-slide-audio.mp3       # TTS audio
    │   └── render-metadata.json            # Tracks image & video renders
    └── 02-slide/
        └── ...
```

**Remotion Renders (images & videos are stored by Remotion with render ID prefix):**

```
renders/
├── {image-render-id}/
│   └── {presentation-id}/output/01-slide/generated-slide-image.png
├── {video-render-id}/
│   └── {presentation-id}/output/01-slide/generated-slide-video.mp4
└── {concat-render-id}/
    └── {presentation-id}/output/final-video.mp4
```

**render-metadata.json Structure:**

```json
{
  "slideNumber": "01",
  "bucketName": "remotionlambda-useast1-xxx",
  "updatedAt": "2024-01-15T10:30:00Z",
  "image": {
    "renderId": "abc123",
    "status": "completed",
    "url": "https://bucket.s3.../renders/abc123/{presentation-id}/output/01-slide/generated-slide-image.png",
    "startedAt": "2024-01-15T10:29:00Z",
    "completedAt": "2024-01-15T10:29:05Z"
  },
  "video": {
    "renderId": "xyz789",
    "status": "rendering",
    "url": "https://bucket.s3.../renders/xyz789/{presentation-id}/output/01-slide/generated-slide-video.mp4",
    "duration": 12.5,
    "startedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Endpoints

### 1. POST /save-preferences

Save slide content and narration manually (without AI).

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "outputBucket": "remotionlambda-useast1-xxx",
  "voice": "Ruth",
  "slides": [
    {
      "slideNumber": "01",
      "slide": {
        "id": "001",
        "type": "title",
        "title": "Welcome",
        "subtitle": "Introduction",
        "narration": "Welcome to our presentation..."
      }
    },
    {
      "slideNumber": "02",
      "slide": {
        "id": "002",
        "type": "bullets",
        "title": "Key Points",
        "bullets": ["Point 1", "Point 2"],
        "bulletAccents": ["Point 1", "Point 2"],
        "narration": "Let's discuss key points..."
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "presentationId": "my-presentation-001",
  "preferencesUrl": "https://bucket.s3.../my-presentation-001/inputs/slide-and-script-preferences.json",
  "slideCount": 2
}
```

**Lambda Action:** Saves JSON to `{presentationId}/inputs/slide-and-script-preferences.json`

---

### 2. POST /generate-from-prompt

Generate slides from a text prompt using Gemini AI.

**Request:**

```json
{
  "presentationId": "ai-pres-001",
  "prompt": "Create a presentation about remote work benefits",
  "numberOfSlides": 5,
  "additionalInstructions": "Include statistics",
  "outputBucket": "remotionlambda-useast1-xxx",
  "voice": "Ruth"
}
```

**Response:**

```json
{
  "success": true,
  "presentationId": "ai-pres-001",
  "promptUrl": "https://bucket.s3.../ai-pres-001/inputs/prompt.txt",
  "generatedContentUrl": "https://bucket.s3.../ai-pres-001/middle/generated-slide-content-all.json",
  "slides": [
    {
      "slideNumber": "01",
      "slide": { "id": "001", "type": "title", ... },
      "generatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Lambda Action:**

1. Saves prompt to `{presentationId}/inputs/prompt.txt`
2. Calls Gemini API to generate slides
3. Saves to `{presentationId}/middle/generated-slide-content-all.json`
4. Also saves to `{presentationId}/inputs/slide-and-script-preferences.json`

---

### 3. POST /generate-slide-image

Generate PNG screenshot of a slide.

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "outputBucket": "remotionlambda-useast1-xxx"
}
```

**Response:**

```json
{
  "success": true,
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "textUrl": "https://bucket.s3.../my-presentation-001/output/01-slide/generated-slide-text.json",
  "imageUrl": "https://bucket.s3.../renders/abc123/my-presentation-001/output/01-slide/generated-slide-image.png",
  "renderId": "abc123"
}
```

**Lambda Action:**

1. Loads slide from preferences
2. Saves slide JSON to `{presentationId}/output/{slideNumber}-slide/generated-slide-text.json`
3. Renders still image via Remotion Lambda
4. Saves image render metadata (renderId, actual URL)
5. **Image stored at:** `renders/{renderId}/{presentationId}/output/{slideNumber}-slide/generated-slide-image.png`

**Note:** Image URL includes `renders/{renderId}/` prefix - this is where Remotion Lambda stores outputs.

---

### 4. POST /generate-slide-audio

Generate TTS audio for a slide.

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "outputBucket": "remotionlambda-useast1-xxx",
  "voice": "Ruth"
}
```

**Response:**

```json
{
  "success": true,
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "audioScriptUrl": "https://bucket.s3.../my-presentation-001/output/01-slide/generated-slide-audio-script.txt",
  "audioUrl": "https://bucket.s3...presigned-url...",
  "duration": 12.5
}
```

**Lambda Action:**

1. Loads narration from preferences
2. Saves script to `{presentationId}/output/{slideNumber}-slide/generated-slide-audio-script.txt`
3. Generates audio via Edge TTS
4. Saves to `{presentationId}/output/{slideNumber}-slide/generated-slide-audio.mp3`

---

### 5. POST /generate-slide-video

Generate video **ONLY** for a slide. **Requires existing audio AND image** - does NOT regenerate audio or image.

Use this when:

- Audio and image already exist and you don't want to regenerate them
- You only want to regenerate the video (e.g., after changing video settings but not content)

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "outputBucket": "remotionlambda-useast1-xxx"
}
```

**Response:**

```json
{
  "success": true,
  "slideId": "001",
  "audioUrl": "https://bucket.s3...presigned...",
  "videoUrl": "https://bucket.s3.../renders/xyz789/my-presentation-001/output/01-slide/generated-slide-video.mp4",
  "duration": 12.5,
  "renderId": "xyz789",
  "bucketName": "remotionlambda-useast1-xxx",
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "renderMetadataUrl": "https://bucket.s3.../my-presentation-001/output/01-slide/render-metadata.json"
}
```

**Lambda Action:**

1. Loads slide from preferences
2. **Checks if audio exists** - throws error if not found
3. **Checks if image exists** - throws error if not found
4. Uses existing audio and image files
5. Renders video via Remotion Lambda (async) using stored image
6. Saves video render metadata

**Error if audio missing:**

```json
{
  "success": false,
  "error": "Audio not found for slide 01. Please generate audio first using /generate-slide-audio or use /generate-slide-all"
}
```

**Error if image missing:**

```json
{
  "success": false,
  "error": "Image not found for slide 01. Please generate image first using /generate-slide-image or use /generate-slide-all"
}
```

---

### 6. POST /generate-slide-all

Generate **ALL** artifacts for a slide: audio + image + video. **Regenerates everything** even if they exist.

Use this when:

- Starting fresh for a slide
- Content AND narration have changed
- You want to regenerate everything

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "outputBucket": "remotionlambda-useast1-xxx",
  "voice": "Ruth"
}
```

**Response:**

```json
{
  "success": true,
  "slideId": "001",
  "audioUrl": "https://bucket.s3...presigned...",
  "videoUrl": "https://bucket.s3.../renders/xyz789/my-presentation-001/output/01-slide/generated-slide-video.mp4",
  "imageUrl": "https://bucket.s3.../renders/abc123/my-presentation-001/output/01-slide/generated-slide-image.png",
  "duration": 12.5,
  "renderId": "xyz789",
  "bucketName": "remotionlambda-useast1-xxx",
  "presentationId": "my-presentation-001",
  "slideNumber": "01",
  "renderMetadataUrl": "https://bucket.s3.../my-presentation-001/output/01-slide/render-metadata.json"
}
```

**Lambda Action:**

1. Loads slide from preferences
2. Saves slide text JSON
3. **Generates audio** (TTS) - always regenerates
4. **Generates image** (PNG screenshot) - always regenerates
5. **Renders video** via Remotion Lambda (async) using the generated image
6. Saves render metadata for both image and video

---

### 7. POST /presentation-status

Get status of all artifacts for a presentation.

**Request:**

```json
{
  "presentationId": "my-presentation-001",
  "outputBucket": "remotionlambda-useast1-xxx"
}
```

**Response:**

```json
{
  "success": true,
  "presentationId": "my-presentation-001",
  "hasPreferences": true,
  "hasPrompt": false,
  "hasGeneratedContent": false,
  "slides": [
    {
      "slideNumber": "01",
      "hasText": true,
      "hasImage": true,
      "hasAudioScript": true,
      "hasAudio": true,
      "hasVideo": true,
      "imageStatus": "completed",
      "imageRenderId": "abc123",
      "imageUrl": "https://bucket.s3.../renders/abc123/my-presentation-001/output/01-slide/generated-slide-image.png",
      "videoStatus": "completed",
      "videoRenderId": "xyz789",
      "videoUrl": "https://bucket.s3.../renders/xyz789/my-presentation-001/output/01-slide/generated-slide-video.mp4"
    },
    {
      "slideNumber": "02",
      "hasText": true,
      "hasImage": false,
      "hasAudioScript": false,
      "hasAudio": false,
      "hasVideo": false,
      "videoStatus": "rendering",
      "videoRenderId": "def456",
      "videoUrl": "https://bucket.s3.../renders/def456/my-presentation-001/output/02-slide/generated-slide-video.mp4"
    }
  ]
}
```

---

### 8. POST /render-status

Check Remotion render progress.

**Request:**

```json
{
  "renderId": "xyz789",
  "bucketName": "remotionlambda-useast1-xxx"
}
```

**Response:**

```json
{
  "success": true,
  "renderId": "xyz789",
  "done": true,
  "overallProgress": 1.0,
  "outputFile": "my-presentation-001/output/01-slide/generated-slide-video.mp4",
  "outputUrl": "https://bucket.s3.../my-presentation-001/output/01-slide/generated-slide-video.mp4",
  "currentStep": "Complete"
}
```

---

### 9. POST /concatenate-videos

Concatenate multiple slide videos into one.

**Request:**

```json
{
  "videoUrls": [
    "my-presentation-001/output/01-slide/generated-slide-video.mp4",
    "my-presentation-001/output/02-slide/generated-slide-video.mp4"
  ],
  "renderIds": ["render-id-001", "render-id-002"],
  "outputBucket": "remotionlambda-useast1-xxx",
  "outputKey": "my-presentation-001/output/final-video.mp4",
  "presentationId": "my-presentation-001"
}
```

**Response:**

```json
{
  "success": true,
  "outputUrl": "https://bucket.s3.../my-presentation-001/output/final-video.mp4",
  "totalDuration": 45.5,
  "videoCount": 2,
  "renderId": "concat-123",
  "bucketName": "remotionlambda-useast1-xxx"
}
```

---

### 10. POST /generate-slide (Legacy)

Original endpoint - still works for backward compatibility.

**Request:**

```json
{
  "slide": {
    "id": "test-001",
    "type": "bullets",
    "title": "Test",
    "bullets": ["Point 1", "Point 2"],
    "narration": "Test narration..."
  },
  "outputBucket": "remotionlambda-useast1-xxx",
  "outputPrefix": "test/"
}
```

Or with new path structure:

```json
{
  "slide": { ... },
  "outputBucket": "remotionlambda-useast1-xxx",
  "presentationId": "my-presentation-001",
  "slideNumber": "01"
}
```

---

### 11. GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "remotion-automated",
  "timestamp": "2024-01-15T10:30:00Z",
  "endpoints": [
    "POST /generate-slide (legacy)",
    "POST /concatenate-videos",
    "POST /render-status",
    "POST /save-preferences",
    "POST /generate-from-prompt",
    "POST /generate-slide-image",
    "POST /generate-slide-audio",
    "POST /generate-slide-video (video only, requires audio + image)",
    "POST /generate-slide-all (audio + image + video)",
    "POST /presentation-status"
  ]
}
```

---

## Workflow Examples

### Quick Start (Generate Everything at Once)

1. `POST /save-preferences` - Save your slide content
2. `POST /generate-slide-all` - Generate audio + image + video for each slide
3. `POST /render-status` - Poll until videos complete
4. `POST /concatenate-videos` - Combine all slides into final video

### Step-by-Step (Control Each Artifact)

1. `POST /save-preferences` - Save your slide content
2. `POST /generate-slide-audio` - Generate audio for each slide
3. `POST /generate-slide-image` - Generate preview image for each slide
4. `POST /generate-slide-video` - Generate video using existing audio
5. `POST /render-status` - Poll until videos complete
6. `POST /concatenate-videos` - Combine all slides into final video

### AI-Generated Workflow

1. `POST /generate-from-prompt` - AI generates all slides
2. `POST /presentation-status` - Check what exists
3. `POST /generate-slide-all` - Generate all artifacts for each slide
4. `POST /render-status` - Poll until complete
5. `POST /concatenate-videos` - Final video

### Update Content Workflow

When **only slide content changes** (not narration):

1. `POST /save-preferences` - Update slide content
2. `POST /generate-slide-image` - Regenerate image
3. `POST /generate-slide-video` - Regenerate video (uses existing audio and new image)

When **narration changes**:

1. `POST /save-preferences` - Update slide content + narration
2. `POST /generate-slide-all` - Regenerate everything (audio + image + video)

---

## Environment Variables

```
REMOTION_APP_REGION=us-east-1
REMOTION_APP_FUNCTION_NAME=remotion-render-xxx
REMOTION_APP_SERVE_URL=https://bucket.s3.../sites/remotion-video-slides/index.html
GOOGLE_API_KEY=your-gemini-api-key
```

---

## Slide Types

| Type         | Required Fields                     | Optional Fields                       |
| ------------ | ----------------------------------- | ------------------------------------- |
| `title`      | title, narration                    | subtitle                              |
| `bullets`    | title, bullets, narration           | titleAccent, bulletAccents            |
| `paragraphs` | title, paragraphs, narration        | titleAccent, paragraphAccents, footer |
| `image`      | title, bullets, imageUrl, narration | titleAccent, bulletAccents            |

---

## Available Voices

- `Ruth` (default, female)
- `en-US-GuyNeural` (male)
- `en-US-AriaNeural` (female)
- `en-GB-SoniaNeural` (British female)
- [Full list](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)
