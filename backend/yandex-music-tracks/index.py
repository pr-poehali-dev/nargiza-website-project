import json
from typing import Dict, Any, List
from datetime import datetime
from yandex_music import Client


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Fetch latest tracks from Yandex Music artist with CDN covers and update time
    Args: event with httpMethod, queryStringParameters (artistId, maxResults)
          context with request_id
    Returns: HTTP response with tracks list and lastUpdate timestamp
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
        client = Client()
        client.init()
        
        tracks_list: List[Dict[str, Any]] = [
            {
                'id': '133959163',
                'title': 'Гимн алкашей',
                'artist': 'NARGIZA',
                'cover': 'https://avatars.yandex.net/get-music-content/12367043/ebe1c3e0.a.38997077-1/400x400',
                'url': 'https://music.yandex.ru/album/38997077/track/133959163'
            }
        ]
        
        artist_tracks = client.artists_tracks(artist_id, page_size=max_results)
        
        if artist_tracks and artist_tracks.tracks:
            for track in artist_tracks.tracks[:max_results - 1]:
                track_id = str(track.id)
                
                if track_id == '133959163':
                    continue
                
                title = track.title or 'Без названия'
                artist_name = track.artists[0].name if track.artists else 'NARGIZA'
                
                album_id = track.albums[0].id if track.albums else ''
                cover_uri = track.cover_uri or (track.albums[0].cover_uri if track.albums else '')
                
                cover_url = f'https://{cover_uri.replace("%%", "400x400")}' if cover_uri else ''
                track_url = f'https://music.yandex.ru/album/{album_id}/track/{track_id}' if album_id else ''
                
                tracks_list.append({
                    'id': track_id,
                    'title': title,
                    'artist': artist_name,
                    'cover': cover_url,
                    'url': track_url
                })
                
                if len(tracks_list) >= max_results:
                    break
        
        now = datetime.now()
        update_time = now.strftime('%H:%M')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'tracks': tracks_list,
                'lastUpdate': update_time
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to fetch tracks: {str(e)}'}),
            'isBase64Encoded': False
        }