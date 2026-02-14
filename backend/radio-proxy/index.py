import base64
import json
import requests

def handler(event, context):
    """Прокси для радиопотока — пробрасывает HTTP-стрим через HTTPS"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Range',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    stream_url = 'http://130.49.148.73:1030'
    chunk_size = 256 * 1024

    try:
        response = requests.get(
            stream_url,
            headers={'Icy-MetaData': '0'},
            stream=True,
            timeout=10
        )
        response.raise_for_status()

        content_type = response.headers.get('Content-Type', 'audio/mpeg')
        data = b''
        for chunk in response.iter_content(chunk_size=8192):
            data += chunk
            if len(data) >= chunk_size:
                break
        response.close()

        body_b64 = base64.b64encode(data).decode('utf-8')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': content_type,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store',
            },
            'body': body_b64,
            'isBase64Encoded': True
        }
    except Exception as e:
        print(f'Radio proxy error: {type(e).__name__}: {e}')
        return {
            'statusCode': 502,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }
