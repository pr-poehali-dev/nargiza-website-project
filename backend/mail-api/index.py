import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с почтой - получение, отправка, управление письмами
    Args: event - dict с httpMethod, body, queryStringParameters, headers
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            mailbox = params.get('mailbox', 'Inbox')
            
            cursor.execute(
                """
                SELECT m.id FROM mailboxes m 
                WHERE m.user_id = %s AND m.name = %s
                """,
                (int(user_id), mailbox)
            )
            mailbox_row = cursor.fetchone()
            
            if not mailbox_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Mailbox not found'})
                }
            
            mailbox_id = mailbox_row[0]
            
            cursor.execute(
                """
                SELECT e.id, e.from_address, e.to_address, e.subject, 
                       e.body, e.is_read, e.is_starred, e.received_at,
                       COALESCE(
                           (SELECT COUNT(*) FROM attachments WHERE email_id = e.id), 
                           0
                       ) as attachment_count
                FROM emails e
                WHERE e.mailbox_id = %s
                ORDER BY e.received_at DESC
                LIMIT 100
                """,
                (mailbox_id,)
            )
            
            emails = []
            for row in cursor.fetchall():
                emails.append({
                    'id': row[0],
                    'from': row[1],
                    'to': row[2],
                    'subject': row[3],
                    'body': row[4],
                    'is_read': row[5],
                    'is_starred': row[6],
                    'received_at': row[7].isoformat() if row[7] else None,
                    'attachment_count': row[8]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'emails': emails, 'mailbox': mailbox})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'send':
                to_address = body_data.get('to')
                subject = body_data.get('subject', '')
                body_text = body_data.get('body', '')
                
                cursor.execute(
                    "SELECT id FROM mailboxes WHERE user_id = %s AND name = 'Sent'",
                    (int(user_id),)
                )
                sent_mailbox = cursor.fetchone()
                
                if sent_mailbox:
                    cursor.execute(
                        "SELECT email FROM mail_users WHERE id = %s",
                        (int(user_id),)
                    )
                    from_email = cursor.fetchone()[0]
                    
                    cursor.execute(
                        """
                        INSERT INTO emails (mailbox_id, from_address, to_address, subject, body)
                        VALUES (%s, %s, %s, %s, %s) RETURNING id
                        """,
                        (sent_mailbox[0], from_email, to_address, subject, body_text)
                    )
                    email_id = cursor.fetchone()[0]
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'email_id': email_id})
                    }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            email_id = body_data.get('email_id')
            action = body_data.get('action')
            
            if action == 'mark_read':
                cursor.execute(
                    """
                    UPDATE emails SET is_read = true 
                    WHERE id = %s AND mailbox_id IN (
                        SELECT id FROM mailboxes WHERE user_id = %s
                    )
                    """,
                    (email_id, int(user_id))
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'toggle_star':
                cursor.execute(
                    """
                    UPDATE emails SET is_starred = NOT is_starred 
                    WHERE id = %s AND mailbox_id IN (
                        SELECT id FROM mailboxes WHERE user_id = %s
                    )
                    """,
                    (email_id, int(user_id))
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
