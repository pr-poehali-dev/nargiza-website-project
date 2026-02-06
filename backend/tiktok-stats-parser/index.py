import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Ручное обновление статистики TikTok через POST запрос'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Отправь POST запрос с follower_count и heart_count для обновления статистики TikTok',
                'example': {
                    'follower_count': 1234567,
                    'heart_count': 9876543
                }
            }),
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed, use POST'}),
            'isBase64Encoded': False
        }
    
    try:
        body = event.get('body', '{}')
        data = json.loads(body)
        
        follower_count = data.get('follower_count', 0)
        heart_count = data.get('heart_count', 0)
        
        if follower_count == 0 and heart_count == 0:
            raise Exception('Укажи follower_count и heart_count')
        
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