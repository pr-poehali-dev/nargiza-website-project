import json
import os
import psycopg2
import requests
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Автоматический парсинг актуальной статистики месячных слушателей со Spotify for Artists'''
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
    
    spotify_email = os.environ.get('SPOTIFY_EMAIL')
    spotify_password = os.environ.get('SPOTIFY_PASSWORD')
    
    if not spotify_email or not spotify_password:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing Spotify credentials in environment'}),
            'isBase64Encoded': False
        }
    
    try:
        session = requests.Session()
        
        # Step 1: Get login page to obtain CSRF token
        login_page = session.get('https://accounts.spotify.com/login', timeout=10)
        
        # Step 2: Authenticate
        login_url = 'https://accounts.spotify.com/login/password'
        login_payload = {
            'username': spotify_email,
            'password': spotify_password,
            'remember': 'true'
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        login_response = session.post(login_url, data=login_payload, headers=headers, timeout=10)
        
        if login_response.status_code != 200:
            raise Exception(f'Login failed with status {login_response.status_code}')
        
        # Step 3: Access Spotify for Artists API
        artists_api_url = 'https://generic.wg.spotify.com/artist-identity-view/v2/profile'
        
        artists_response = session.get(artists_api_url, headers=headers, timeout=10)
        
        if artists_response.status_code != 200:
            raise Exception(f'Artists API request failed with status {artists_response.status_code}')
        
        data = artists_response.json()
        
        # Extract monthly listeners
        monthly_listeners = None
        
        if 'artistGid' in data and 'monthlyListeners' in data:
            monthly_listeners = data.get('monthlyListeners')
        
        if not monthly_listeners:
            raise Exception('Could not extract monthly listeners from Spotify API response')
        
        monthly_listeners = int(monthly_listeners)
        
        # Update database
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
        """, ('spotify', monthly_listeners))

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
                'platform': 'spotify',
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
