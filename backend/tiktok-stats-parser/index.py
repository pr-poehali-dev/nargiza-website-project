import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Автоматический парсинг статистики TikTok через SocialData API'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    tiktok_username = os.environ.get('TIKTOK_USERNAME', 'nargizamuz')
    
    try:
        url = 'https://social-data-api1.p.rapidapi.com/user/info'
        
        headers = {
            'x-rapidapi-key': os.environ.get('RAPIDAPI_KEY'),
            'x-rapidapi-host': 'social-data-api1.p.rapidapi.com'
        }
        
        params = {
            'username': tiktok_username
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=15)
        
        if response.status_code != 200:
            raise Exception(f'SocialData API returned status {response.status_code}: {response.text[:200]}')
        
        data = response.json()
        
        if not data or 'follower_count' not in data:
            raise Exception(f'Invalid API response: {json.dumps(data)[:300]}')
        
        follower_count = data.get('follower_count', 0)
        heart_count = data.get('heart_count', 0)
        
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

        cursor.execute(f"""
            INSERT INTO music_streams (platform, monthly_streams, view_count, updated_at)
            VALUES ('tiktok', {follower_count}, {heart_count}, CURRENT_TIMESTAMP)
            ON CONFLICT (platform) 
            DO UPDATE SET 
                monthly_streams = EXCLUDED.monthly_streams,
                view_count = EXCLUDED.view_count,
                updated_at = CURRENT_TIMESTAMP
        """)

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
                'username': tiktok_username,
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