import urllib.request
import base64

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

    try:
        req = urllib.request.Request(stream_url)
        req.add_header('Icy-MetaData', '0')

        with urllib.request.urlopen(req, timeout=5) as response:
            chunk = response.read(256 * 1024)
            content_type = response.headers.get('Content-Type', 'audio/mpeg')

        body_b64 = base64.b64encode(chunk).decode('utf-8')

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
        return {
            'statusCode': 502,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': '{"error": "Stream unavailable"}'
        }
