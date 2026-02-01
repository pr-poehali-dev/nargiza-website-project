import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Автоматический парсинг актуальной статистики месячных слушателей с Yandex Music API'''
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
    
    artist_id = '9639626'
    
    try:
        api_url = f'https://music.yandex.ru/handlers/artist.jsx?artist={artist_id}'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': f'https://music.yandex.ru/artist/{artist_id}'
        }
        
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            raise Exception(f'API request failed with status {response.status_code}')
        
        data = response.json()
        
        monthly_listeners = None
        
        if 'stats' in data and data['stats']:
            stats = data['stats']
            monthly_listeners = stats.get('lastMonthListeners')
        
        if not monthly_listeners:
            raise Exception('Could not extract monthly listeners from API response')
        
        monthly_listeners = int(monthly_listeners)
        
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
        """, ('yandex', monthly_listeners))

        now = datetime.now()
        month_names = {
            1: 'Январь', 2: 'Февраль', 3: 'Март', 4: 'Апрель',
            5: 'Май', 6: 'Июнь', 7: 'Июль', 8: 'Август',
            9: 'Сентябрь', 10: 'Октябрь', 11: 'Ноябрь', 12: 'Декабрь'
        }
        current_month = month_names[now.month]
        current_year = now.year
        
        cursor.execute("""
            INSERT INTO yandex_music_history (month_name, year, listeners, recorded_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (month_name, year) 
            DO UPDATE SET 
                listeners = EXCLUDED.listeners,
                recorded_at = CURRENT_TIMESTAMP
        """, (current_month, current_year, monthly_listeners))

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
                'platform': 'yandex',
                'monthly_listeners': monthly_listeners,
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