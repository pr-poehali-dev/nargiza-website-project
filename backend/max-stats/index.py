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
                
                patterns = [
                    r'(\d+[\s\d]*[kкKК]?)\s*подписчик',
                    r'(\d+[\s\d]*[kкKК]?)\s*участник',
                    r'subscribers["\']?\s*:\s*["\']?(\d+)',
                    r'members["\']?\s*:\s*["\']?(\d+)',
                    r'"subscribersCount"\s*:\s*(\d+)',
                    r'"membersCount"\s*:\s*(\d+)',
                ]
                
                subscribers_match = None
                for pattern in patterns:
                    subscribers_match = re.search(pattern, html, re.IGNORECASE)
                    if subscribers_match:
                        break
                
                debug_mode = event.get('queryStringParameters', {}).get('debug') == 'true'
                
                if debug_mode:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'html_preview': html[:3000],
                            'html_length': len(html)
                        })
                    }
                
                if subscribers_match:
                    count_str = subscribers_match.group(1).replace(' ', '').replace('\xa0', '').replace(',', '')
                    
                    if 'k' in count_str.lower() or 'к' in count_str.lower():
                        count_str = count_str.lower().replace('k', '').replace('к', '')
                        count = int(float(count_str) * 1000)
                    else:
                        count = int(count_str)
                    
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
                            'error': 'Subscribers count not found in HTML',
                            'html_preview': html[:500]
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