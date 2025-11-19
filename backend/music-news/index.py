import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from typing import Dict, Any, List
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Fetch latest music news from RSS feeds
    Args: event - HTTP request event
          context - execution context
    Returns: HTTP response with news articles
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    query_params = event.get('queryStringParameters') or {}
    max_results = int(query_params.get('maxResults', '6'))
    
    rss_feeds = [
        'https://www.intermedia.ru/rss/',
        'https://zvuki.ru/feed/',
        'https://daily.afisha.ru/rss/music/'
    ]
    
    articles: List[Dict[str, str]] = []
    
    try:
        for feed_url in rss_feeds:
            if len(articles) >= max_results:
                break
                
            try:
                req = urllib.request.Request(feed_url)
                req.add_header('User-Agent', 'Mozilla/5.0')
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    xml_data = response.read().decode('utf-8')
                    root = ET.fromstring(xml_data)
                    
                    for item in root.findall('.//item')[:max_results - len(articles)]:
                        title = item.find('title')
                        description = item.find('description')
                        link = item.find('link')
                        pub_date = item.find('pubDate')
                        
                        enclosure = item.find('enclosure')
                        image_url = ''
                        if enclosure is not None and enclosure.get('type', '').startswith('image'):
                            image_url = enclosure.get('url', '')
                        
                        media_content = item.find('.//{http://search.yahoo.com/mrss/}content')
                        if not image_url and media_content is not None:
                            image_url = media_content.get('url', '')
                        
                        articles.append({
                            'title': title.text if title is not None else 'Без названия',
                            'description': description.text[:200] if description is not None and description.text else 'Описание недоступно',
                            'url': link.text if link is not None else '',
                            'urlToImage': image_url,
                            'publishedAt': pub_date.text if pub_date is not None else datetime.now().isoformat(),
                            'source': feed_url.split('/')[2]
                        })
                        
            except Exception as e:
                continue
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'articles': articles,
                'total': len(articles),
                'version': '2.0'
            }, ensure_ascii=False)
        }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e), 'articles': [], 'total': 0})
        }