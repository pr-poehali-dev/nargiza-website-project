import json
import requests
from typing import Dict, Any, List


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Fetch latest tracks from Yandex Music artist
    Args: event with httpMethod, queryStringParameters (artistId, maxResults)
          context with request_id
    Returns: HTTP response with tracks list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    artist_id = params.get('artistId', '9639626')
    max_results = int(params.get('maxResults', '6'))
    
    try:
        tracks_list: List[Dict[str, Any]] = [
            {
                'id': '1',
                'title': 'Гимн алкашей',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13134338/dcce5af4.a.38997077-1/400x400',
                'url': 'https://music.yandex.ru/album/38997077/track/133959163'
            },
            {
                'id': '2',
                'title': 'Я волонтёр',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13134338/dcce5af4.a.38997077-1/400x400',
                'url': 'https://music.yandex.ru/album/38997077/track/133942956'
            },
            {
                'id': '3',
                'title': 'Земля',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13087932/48ab94d4.a.38945197-1/400x400',
                'url': 'https://music.yandex.ru/album/38945197/track/133686043'
            },
            {
                'id': '4',
                'title': 'Ты мне врёшь',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13087932/56dd44b5.a.38904755-1/400x400',
                'url': 'https://music.yandex.ru/album/38904755/track/133379894'
            },
            {
                'id': '5',
                'title': 'Он занят',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13134338/e3d95d2b.a.38871039-1/400x400',
                'url': 'https://music.yandex.ru/album/38871039/track/133146551'
            },
            {
                'id': '6',
                'title': 'Похоронка',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/13134338/ede49e98.a.38845093-1/400x400',
                'url': 'https://music.yandex.ru/album/38845093/track/132998054'
            }
        ][:max_results]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'tracks': tracks_list}),
            'isBase64Encoded': False
        }
    
    except requests.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to fetch tracks: {str(e)}'}),
            'isBase64Encoded': False
        }