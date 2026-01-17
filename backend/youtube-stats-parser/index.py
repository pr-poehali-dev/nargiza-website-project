import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Автоматический парсинг количества подписчиков с YouTube канала'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Cron-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    cron_token = os.environ.get('STATS_CRON_TOKEN', '')
    provided_token = event.get('headers', {}).get('x-cron-token', '')
    
    if cron_token and provided_token != cron_token:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unauthorized: Invalid cron token'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('YOUTUBE_API_KEY')
    channel_identifier = os.environ.get('YOUTUBE_CHANNEL_ID', '@nargizamuz')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing YOUTUBE_API_KEY in environment'}),
            'isBase64Encoded': False
        }
    
    try:
        api_url = f'https://www.googleapis.com/youtube/v3/channels'
        
        if channel_identifier.startswith('@'):
            params = {
                'part': 'statistics',
                'forHandle': channel_identifier,
                'key': api_key
            }
        else:
            params = {
                'part': 'statistics',
                'id': channel_identifier,
                'key': api_key
            }
        
        response = requests.get(api_url, params=params, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f'YouTube API request failed with status {response.status_code}')
        
        data = response.json()
        
        if 'items' not in data or len(data['items']) == 0:
            raise Exception('Channel not found or invalid channel ID')
        
        subscriber_count = data['items'][0]['statistics'].get('subscriberCount')
        
        if not subscriber_count:
            raise Exception('Could not extract subscriber count from API response')
        
        subscriber_count = int(subscriber_count)
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS music_streams (
                platform VARCHAR(50) PRIMARY KEY,
                monthly_streams INTEGER NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            INSERT INTO music_streams (platform, monthly_streams, updated_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (platform) 
            DO UPDATE SET 
                monthly_streams = EXCLUDED.monthly_streams,
                updated_at = CURRENT_TIMESTAMP
        """, ('youtube', subscriber_count))

        cursor.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'platform': 'youtube',
                'subscriber_count': subscriber_count,
                'updated_at': datetime.now().isoformat()
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
            'body': json.dumps({'error': f'Parser failed: {str(e)}'}),
            'isBase64Encoded': False
        }