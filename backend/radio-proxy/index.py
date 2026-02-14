import json
import base64
import requests

BASE = 'http://130.49.148.73:1030'

def handler(event, context):
    """Прокси для радиопотока streaming.center"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}

    if params.get('debug'):
        results = {}
        paths = [
            '/api/v2/servers/1/mount_points/',
            '/api/v2/servers/1/mounts/',
            '/api/v2/servers/1/streams/',
            '/api/v2/servers/1/status/',
            '/api/v2/servers/1/now_playing/',
            '/api/v2/servers/1/currently_playing/',
            '/api/v2/mount_points/?server=1',
            '/api/v2/mounts/?server=1',
            '/api/v2/streams/?server=1',
            '/api/v2/now_playing/?server=1',
            '/api/v2/currently_playing/?server=1',
        ]
        for path in paths:
            try:
                r = requests.get(BASE + path, timeout=3, headers={'Accept': 'application/json'})
                ct = r.headers.get('Content-Type', '')
                results[path] = {
                    'status': r.status_code,
                    'json': 'json' in ct,
                    'body': r.text[:500]
                }
            except Exception as e:
                results[path] = {'error': str(e)}
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(results, ensure_ascii=False)
        }

    try:
        stream_url = _get_stream_url()
        if not stream_url:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Stream URL not found'})
            }

        print(f'Proxying: {stream_url}')
        r = requests.get(
            stream_url,
            headers={'Icy-MetaData': '1', 'User-Agent': 'Mozilla/5.0'},
            stream=True,
            timeout=(5, 15)
        )
        ct = r.headers.get('Content-Type', '')
        
        data = b''
        for chunk in r.iter_content(chunk_size=8192):
            data += chunk
            if len(data) >= 256 * 1024:
                break
        r.close()
        print(f'Read {len(data)} bytes, ct={ct}')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': ct if 'audio' in ct else 'audio/mpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store',
            },
            'body': base64.b64encode(data).decode('utf-8'),
            'isBase64Encoded': True
        }
    except Exception as e:
        print(f'Error: {type(e).__name__}: {e}')
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }


def _get_stream_url():
    endpoints = [
        '/api/v2/servers/1/mount_points/',
        '/api/v2/servers/1/mounts/',
        '/api/v2/servers/1/streams/',
        '/api/v2/mount_points/?server=1',
        '/api/v2/mounts/?server=1',
        '/api/v2/streams/?server=1',
        '/api/v2/servers/1/status/',
        '/api/v2/servers/1/now_playing/',
        '/api/v2/now_playing/?server=1',
    ]
    for path in endpoints:
        try:
            r = requests.get(BASE + path, timeout=3, headers={'Accept': 'application/json'})
            if r.status_code == 200:
                ct = r.headers.get('Content-Type', '')
                if 'json' in ct:
                    data = r.json()
                    print(f'{path}: {json.dumps(data, default=str)[:300]}')
                    url = _deep_find_stream(data)
                    if url:
                        return url
        except Exception:
            continue
    return None


def _deep_find_stream(data):
    if isinstance(data, dict):
        for key in ['stream_url', 'listen_url', 'mount_url', 'url', 'audio_url', 'mp3_url']:
            val = data.get(key)
            if val and isinstance(val, str) and ('://' in val or val.endswith('.mp3') or val.endswith('.aac')):
                return val if val.startswith('http') else BASE + val
        for val in data.values():
            if isinstance(val, (dict, list)):
                result = _deep_find_stream(val)
                if result:
                    return result
    elif isinstance(data, list):
        for item in data:
            result = _deep_find_stream(item)
            if result:
                return result
    return None
