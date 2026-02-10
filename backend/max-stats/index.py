import json
import urllib.request
import urllib.error
import re

def handler(event: dict, context) -> dict:
    '''Парсит количество подписчиков со страницы Max'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method == 'GET':
        max_url = 'https://max.ru/join/btkovK_LOSzZKNOdqyqwtZQVlqwxcQX56V63RCHNNSE'
        
        try:
            req = urllib.request.Request(
                max_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8')
                
                print(f'HTML snippet: {html[:2000]}...')
                
                subscribers_match = re.search(r'(\d+[\s\d]*)\s*подписчик', html, re.IGNORECASE)
                if not subscribers_match:
                    subscribers_match = re.search(r'(\d+[\s\d]*)\s*участник', html, re.IGNORECASE)
                
                if subscribers_match:
                    count_str = subscribers_match.group(1).replace(' ', '').replace('\xa0', '')
                    count = int(count_str)
                    print(f'Found: {subscribers_match.group(0)} -> {count}')
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'subscribers': count,
                            'source': 'max'
                        })
                    }
                else:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'subscribers': 0,
                            'source': 'max',
                            'error': 'Subscribers count not found in HTML'
                        })
                    }
                    
        except urllib.error.URLError as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Request failed: {str(e)}'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Internal error: {str(e)}'})
            }

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }