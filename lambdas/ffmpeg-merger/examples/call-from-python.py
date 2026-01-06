"""
Example: Call FFmpeg Merger Lambda from Python application

Install: pip install boto3
"""

import json
import boto3
import os
from typing import List, Optional

lambda_client = boto3.client(
    'lambda',
    region_name='us-east-1',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
)

def merge_videos(
    clips: List[str],
    output_key: Optional[str] = None,
    padding_seconds: int = 1
) -> dict:
    """
    Merge multiple video clips from S3
    
    Args:
        clips: List of S3 URLs or keys
        output_key: Output S3 key (default: auto-generated)
        padding_seconds: Seconds of padding between clips
        
    Returns:
        dict with success, outputKey, s3Url
    """
    payload = {
        'clips': [{'s3Url': url} for url in clips],
        'outputKey': output_key or f'merged/output-{int(time.time())}.mp4',
        'paddingSeconds': padding_seconds,
    }
    
    print('Invoking Lambda function...')
    print('Payload:', json.dumps(payload, indent=2))
    
    response = lambda_client.invoke(
        FunctionName='ffmpeg-video-merger',
        Payload=json.dumps(payload),
    )
    
    result = json.loads(response['Payload'].read())
    body = json.loads(result['body'])
    
    return body

# Example usage
if __name__ == '__main__':
    import time
    
    clips = [
        's3://remotionlambda-useast1-ele686axd8/videos/clip1.mp4',
        's3://remotionlambda-useast1-ele686axd8/videos/clip2.mp4',
        's3://remotionlambda-useast1-ele686axd8/videos/clip3.mp4',
    ]
    
    try:
        result = merge_videos(
            clips=clips,
            output_key='merged/my-final-video.mp4',
            padding_seconds=1
        )
        
        print('\nSuccess!')
        print('Output:', json.dumps(result, indent=2))
        print('Download from:', result['s3Url'])
    except Exception as e:
        print('Error:', str(e))

