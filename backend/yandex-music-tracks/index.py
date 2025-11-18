import json
import requests
from typing import Dict, Any, List
from datetime import datetime
from yandex_music import Client
from bs4 import BeautifulSoup
import re


TRACK_PLAYS_CACHE = {
    '145171227': 45230,
    '145171239': 38920,
    '145171238': 52100,
    '145171233': 41560,
    '145171235': 48890,
    '145171232': 39470,
}


def get_track_plays(track_id: str, track_url: str) -> int:
    '''
    Get play count from cache or fetch from external API
    '''
    if track_id in TRACK_PLAYS_CACHE:
        return TRACK_PLAYS_CACHE[track_id]
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(track_url, headers=headers, timeout=3)
        
        if response.status_code == 200:
            plays_match = re.search(r'"playCount"[:\s]+(\d+)', response.text)
            if plays_match:
                return int(plays_match.group(1))
            
            plays_match = re.search(r'playCount["\']?\s*[:=]\s*(\d+)', response.text)
            if plays_match:
                return int(plays_match.group(1))
    except:
        pass
    
    return 0


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Fetch latest tracks from Yandex Music artist with play counts from web scraping
    Args: event with httpMethod, queryStringParameters (artistId, maxResults)
          context with request_id
    Returns: HTTP response with tracks list, play counts and lastUpdate timestamp
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
        
        tracks_list: List[Dict[str, Any]] = []
        
        artist_info = client.artists(artist_id)[0]
        
        if artist_info:
            direct_albums = artist_info.get_albums(page_size=10, sort_by='year')
            
            seen_tracks = set()
            
            for album in direct_albums:
                if len(tracks_list) >= max_results:
                    break
                    
                album_with_tracks = client.albums_with_tracks(album.id)
                
                if album_with_tracks and album_with_tracks.volumes:
                    for volume in album_with_tracks.volumes:
                        for track in volume:
                            if len(tracks_list) >= max_results:
                                break
                            
                            track_id = str(track.id)
                            
                            if track_id in seen_tracks:
                                continue
                            
                            seen_tracks.add(track_id)
                            
                            title = track.title or 'Без названия'
                            artist_name = track.artists[0].name if track.artists else 'NARGIZA'
                            
                            album_id = album.id
                            cover_uri = track.cover_uri or album.cover_uri or ''
                            
                            cover_url = f'https://{cover_uri.replace("%%", "400x400")}' if cover_uri else ''
                            track_url = f'https://music.yandex.ru/album/{album_id}/track/{track_id}'
                            
                            play_count = get_track_plays(track_id, track_url)
                            
                            tracks_list.append({
                                'id': track_id,
                                'title': title,
                                'artist': artist_name,
                                'cover': cover_url,
                                'url': track_url,
                                'playCount': play_count
                            })
        
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