import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Автоматический парсинг статистики с TikTok профиля'''
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
    
    tiktok_username = os.environ.get('TIKTOK_USERNAME', 'nargizamuz')
    rapidapi_key = os.environ.get('RAPIDAPI_KEY')
    
    if not rapidapi_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing RAPIDAPI_KEY in environment'}),
            'isBase64Encoded': False
        }
    
    try:
        api_url = 'https://tiktok-scraper7.p.rapidapi.com/user/info'
        
        headers = {
            'x-rapidapi-key': rapidapi_key,
            'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com'
        }
        
        params = {
            'unique_id': tiktok_username
        }
        
        response = requests.get(api_url, headers=headers, params=params, timeout=15)
        
        if response.status_code != 200:
            raise Exception(f'TikTok API request failed with status {response.status_code}')
        
        data = response.json()
        
        if 'data' not in data or 'user' not in data['data']:
            raise Exception('Invalid TikTok API response format')
        
        user_data = data['data']['user']
        stats = user_data.get('stats', {})
        
        follower_count = stats.get('followerCount', 0)
        heart_count = stats.get('heartCount', 0)
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS music_streams (
                platform VARCHAR(50) PRIMARY KEY,
                monthly_streams INTEGER NOT NULL,
                view_count BIGINT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            ALTER TABLE music_streams 
            ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0
        """)

        cursor.execute("""
            INSERT INTO music_streams (platform, monthly_streams, view_count, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (platform) 
            DO UPDATE SET 
                monthly_streams = EXCLUDED.monthly_streams,
                view_count = EXCLUDED.view_count,
                updated_at = CURRENT_TIMESTAMP
        """, ('tiktok', follower_count, heart_count))

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
                'platform': 'tiktok',
                'follower_count': follower_count,
                'heart_count': heart_count,
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
