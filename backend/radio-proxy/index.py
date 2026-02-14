import json
import base64
import requests

def handler(event, context):
    """Прокси для радиопотока"""
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

    host = '130.49.148.73'
    base = f'http://{host}:1030'
    params = event.get('queryStringParameters') or {}
    debug = params.get('debug')

    if debug:
        results = {}
        api_paths = [
            '/api/v2/live-streams-merged/',
            '/api/v2/live-streams-merged',
            '/api/v2/stations/',
            '/api/v2/station/1/',
            '/api/v2/station/1/stream/',
            '/api/v2/station/1/mount-points/',
            '/api/v2/station/1/streams/',
            '/api/v2/station/1/hls/',
            '/api/v2/nowplaying/',
            '/api/v2/nowplaying/1/',
        ]
        for path in api_paths:
            try:
                r = requests.get(base + path, timeout=3, headers={'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'})
                ct = r.headers.get('Content-Type', '')
                results[path] = {
                    'status': r.status_code,
                    'content_type': ct,
                    'body': r.text[:500]
                }
            except Exception as e:
                results[path] = {'error': str(e)}

        hls_paths = [
            f'http://{host}:1030/hls/',
            f'http://{host}:1030/hls/live.m3u8',
            f'http://{host}:1030/api/v2/station/1/hls',
        ]
        for url in hls_paths:
            try:
                r = requests.get(url, timeout=3)
                results[url] = {
                    'status': r.status_code,
                    'content_type': r.headers.get('Content-Type', ''),
                    'body': r.text[:500]
                }
            except Exception as e:
                results[url] = {'error': str(e)}

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(results, ensure_ascii=False, default=str)
        }

    api_paths = [
        '/api/v2/nowplaying/',
        '/api/v2/nowplaying/1/',
        '/api/v2/station/1/',
    ]
    
    for path in api_paths:
        try:
            r = requests.get(base + path, timeout=5, headers={'Accept': 'application/json'})
            if r.status_code == 200 and 'json' in r.headers.get('Content-Type', ''):
                data = r.json()
                listen_url = None
                
                if isinstance(data, list):
                    for item in data:
                        listen_url = _extract_listen_url(item)
                        if listen_url:
                            break
                elif isinstance(data, dict):
                    listen_url = _extract_listen_url(data)
                
                if listen_url:
                    return _proxy_stream(listen_url)
        except Exception:
            continue

    return {
        'statusCode': 404,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Stream not found'})
    }


def _extract_listen_url(data):
    if isinstance(data, dict):
        for key in ['listen_url', 'url', 'stream_url', 'listenUrl', 'streamUrl']:
            if key in data:
                return data[key]
        if 'station' in data:
            return _extract_listen_url(data['station'])
        if 'mounts' in data and isinstance(data['mounts'], list):
            for m in data['mounts']:
                url = _extract_listen_url(m)
                if url:
                    return url
    return None


def _proxy_stream(stream_url):
    print(f'Proxying stream: {stream_url}')
    r = requests.get(
        stream_url,
        headers={'Icy-MetaData': '1', 'User-Agent': 'Mozilla/5.0'},
        stream=True,
        timeout=(5, 15)
    )
    data = b''
    for chunk in r.iter_content(chunk_size=8192):
        data += chunk
        if len(data) >= 256 * 1024:
            break
    r.close()
    print(f'Read {len(data)} bytes')

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store',
        },
        'body': base64.b64encode(data).decode('utf-8'),
        'isBase64Encoded': True
    }
