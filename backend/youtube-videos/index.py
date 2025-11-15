import json
import os
from typing import Dict, Any
from urllib.request import urlopen
from urllib.parse import urlencode

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get latest videos from YouTube channel
    Args: event - dict with httpMethod, queryStringParameters (channelId)
          context - object with attributes: request_id, function_name
    Returns: HTTP response with video list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters', {}) or {}
    channel_handle = params.get('channelHandle', '@nargizamuz')
    max_results = int(params.get('maxResults', '12'))
    
    api_key = os.environ.get('YOUTUBE_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'YouTube API key not configured'})
        }
    
    # Get channel by handle (username)
    channel_url = f'https://www.googleapis.com/youtube/v3/channels?' + urlencode({
        'part': 'contentDetails',
        'forHandle': channel_handle.replace('@', ''),
        'key': api_key
    })
    
    with urlopen(channel_url) as response:
        channel_data = json.loads(response.read().decode())
    
    if 'items' not in channel_data or len(channel_data['items']) == 0:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Channel not found', 'handle': channel_handle})
        }
    
    uploads_playlist_id = channel_data['items'][0]['contentDetails']['relatedPlaylists']['uploads']
    
    # Get videos from uploads playlist
    playlist_url = f'https://www.googleapis.com/youtube/v3/playlistItems?' + urlencode({
        'part': 'snippet',
        'playlistId': uploads_playlist_id,
        'maxResults': str(max_results),
        'key': api_key
    })
    
    with urlopen(playlist_url) as response:
        playlist_data = json.loads(response.read().decode())
    
    videos = []
    for item in playlist_data.get('items', []):
        snippet = item['snippet']
        videos.append({
            'videoId': snippet['resourceId']['videoId'],
            'title': snippet['title'],
            'description': snippet['description'],
            'thumbnail': snippet['thumbnails']['high']['url'],
            'publishedAt': snippet['publishedAt']
        })
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'videos': videos,
            'channelHandle': channel_handle
        })
    }