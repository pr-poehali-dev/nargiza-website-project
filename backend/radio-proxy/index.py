import json
import base64
import requests

STREAM_URL = 'http://130.49.148.73:1040/stream'

def handler(event, context):
    """Прокси для радиопотока NARGIZA Radio"""
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

    try:
        r = requests.get(
            STREAM_URL,
            headers={'Icy-MetaData': '1', 'User-Agent': 'Mozilla/5.0'},
            stream=True,
            timeout=(5, 30)
        )
        ct = r.headers.get('Content-Type', '')

        data = b''
        for chunk in r.iter_content(chunk_size=16384):
            data += chunk
            if len(data) >= 512 * 1024:
                break
        r.close()

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
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }