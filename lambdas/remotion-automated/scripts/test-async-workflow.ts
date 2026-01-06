#!/usr/bin/env node
/**
 * Test the full async workflow:
 * 1. Generate multiple slides with longer narration
 * 2. Poll for completion
 * 3. Concatenate the videos
 *
 * Usage: npx tsx scripts/test-async-workflow.ts
 */

import * as dotenv from "dotenv";

dotenv.config();

// This is a template - update these values with actual responses from your API
const EXAMPLE_WORKFLOW = `
=====================================================
ASYNC VIDEO GENERATION WORKFLOW - EXAMPLE
=====================================================

Step 1: Generate Slides (with 1-2 minute narrations)
-----------------------------------------------------

curl -X POST https://8tpy77esof.execute-api.us-east-1.amazonaws.com/generate-slide \\
  -H "Content-Type: application/json" \\
  -d '{
    "slide": {
      "id": "slide-001",
      "type": "bullets",
      "title": "Introduction to Machine Learning",
      "bullets": [
        "What is Machine Learning?",
        "Why it matters today",
        "Real-world applications"
      ],
      "narration": "Welcome to our comprehensive introduction to machine learning. In this presentation, we will explore the fundamental concepts that make machine learning one of the most transformative technologies of our time. First, we will define what machine learning actually is and how it differs from traditional programming approaches. Then, we will discuss why machine learning has become so critical in today's data-driven world, touching on its impact across various industries. Finally, we will examine several real-world applications that demonstrate the practical power of machine learning, from recommendation systems to autonomous vehicles. By the end of this section, you will have a solid foundation for understanding how machine learning is reshaping our digital landscape."
    },
    "outputBucket": "your-bucket-name",
    "outputPrefix": "videos/ml-course/"
  }'

Response:
{
  "success": true,
  "slideId": "slide-001",
  "audioUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/ml-course/audios/slide-001.mp3",
  "videoUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/ml-course/slide-001.mp4",
  "duration": 75.2,
  "renderId": "abc123xyz789",
  "bucketName": "remotionlambda-useast1-xxxxxx"
}

📝 SAVE THIS: renderId and bucketName for checking status!


Step 2: Check Render Status (Poll every 5-10 seconds)
------------------------------------------------------

curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/render-status \\
  -H "Content-Type: application/json" \\
  -d '{
    "renderId": "abc123xyz789",
    "bucketName": "remotionlambda-useast1-xxxxxx"
  }'

Response while rendering:
{
  "success": true,
  "renderId": "abc123xyz789",
  "done": false,
  "overallProgress": 0.35,
  "currentStep": "Rendering frames"
}

Response when complete:
{
  "success": true,
  "renderId": "abc123xyz789",
  "done": true,
  "overallProgress": 1.0,
  "outputFile": "videos/ml-course/slide-001.mp4",
  "outputUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/ml-course/slide-001.mp4",
  "currentStep": "Complete"
}


Step 3: Repeat for all slides
------------------------------

Generate slide-002, slide-003, etc., and poll each one until complete.


Step 4: Concatenate All Videos
--------------------------------

Once ALL slides are done, concatenate them:

curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/concatenate-videos \\
  -H "Content-Type: application/json" \\
  -d '{
    "videoUrls": [
      "videos/ml-course/slide-001.mp4",
      "videos/ml-course/slide-002.mp4",
      "videos/ml-course/slide-003.mp4"
    ],
    "outputBucket": "your-bucket-name",
    "outputKey": "videos/ml-course/final-course.mp4"
  }'

Response:
{
  "success": true,
  "outputUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/videos/ml-course/final-course.mp4",
  "totalDuration": 285.7,
  "videoCount": 3
}


=====================================================
IMPORTANT NOTES
=====================================================

1. Video rendering is ASYNC - /generate-slide returns immediately
2. You MUST poll /render-status to know when video is ready
3. For 1-2 minute narrations, expect 2-5 minutes render time per slide
4. Only call /concatenate-videos AFTER all slides are complete
5. Audio files are now at: {outputPrefix}audios/{slideId}.mp3
6. Video files are now at: {outputPrefix}{slideId}.mp4

=====================================================
`;

console.log(EXAMPLE_WORKFLOW);

console.log("\n🚀 To test locally:\n");
console.log("1. Start a slide render:");
console.log("   make invoke-generate-slide\n");
console.log("2. Copy the renderId and bucketName from the response\n");
console.log("3. Update the values in scripts/generate-events.ts:");
console.log("   - Edit the 'renderStatus' section");
console.log("   - Replace 'test-render-id' with your actual renderId");
console.log("   - Replace 'test-bucket' with your actual bucketName\n");
console.log("4. Check status:");
console.log("   make invoke-render-status\n");
console.log("5. Once done=true, concatenate:");
console.log("   make invoke-concatenate\n");

console.log("\n📖 For detailed workflow, see: WORKFLOW.md\n");
