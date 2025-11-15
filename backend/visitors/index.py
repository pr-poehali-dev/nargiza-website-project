import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Track and return visitor statistics for the website
    Args: event with httpMethod and requestContext; context with request_id
    Returns: JSON with total and last 24h visitor counts
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'POST':
        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        visitor_ip = identity.get('sourceIp', 'unknown')
        user_agent = identity.get('userAgent', 'unknown')
        
        cur.execute(
            "INSERT INTO visitors (visitor_ip, user_agent) VALUES (%s, %s)",
            (visitor_ip, user_agent)
        )
        conn.commit()
    
    cur.execute("SELECT COUNT(*) FROM visitors")
    total = cur.fetchone()[0]
    
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    cur.execute(
        "SELECT COUNT(*) FROM visitors WHERE visited_at >= %s",
        (twenty_four_hours_ago,)
    )
    last_24h = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'total': total, 'last24h': last_24h})
    }
