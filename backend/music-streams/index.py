import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для получения и обновления статистики прослушиваний на музыкальных платформах'''
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

    if method == 'GET':
        cursor.execute("""
            SELECT platform, monthly_streams, updated_at 
            FROM music_streams
            ORDER BY platform
        """)
        rows = cursor.fetchall()
        
        if not rows:
            default_data = [
                {'platform': 'yandex', 'streams': 12500},
                {'platform': 'spotify', 'streams': 8300},
                {'platform': 'apple', 'streams': 6700}
            ]
            
            for item in default_data:
                cursor.execute("""
                    INSERT INTO music_streams (platform, monthly_streams, updated_at)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                """, (item['platform'], item['streams']))
            
            cursor.execute("""
                SELECT platform, monthly_streams, updated_at 
                FROM music_streams
                ORDER BY platform
            """)
            rows = cursor.fetchall()

        result = {
            row[0]: {
                'streams': row[1],
                'updated_at': row[2].isoformat() if row[2] else None
            }
            for row in rows
        }

        cursor.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        platform = body.get('platform')
        streams = body.get('streams')

        if not platform or streams is None:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'platform and streams are required'}),
                'isBase64Encoded': False
            }

        cursor.execute("""
            INSERT INTO music_streams (platform, monthly_streams, updated_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (platform) 
            DO UPDATE SET 
                monthly_streams = EXCLUDED.monthly_streams,
                updated_at = CURRENT_TIMESTAMP
        """, (platform, streams))

        cursor.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'platform': platform, 'streams': streams}),
            'isBase64Encoded': False
        }

    cursor.close()
    conn.close()

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
