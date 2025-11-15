import json
import os
import psycopg2
import hmac
import hashlib
from typing import Dict, Any
from email.utils import parseaddr

def verify_mailgun_signature(token: str, timestamp: str, signature: str, api_key: str) -> bool:
    '''
    Проверяет подпись webhook от Mailgun для защиты от подделок
    '''
    hmac_digest = hmac.new(
        key=api_key.encode(),
        msg=f'{timestamp}{token}'.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, hmac_digest)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Webhook для приема входящих писем от Mailgun
    Args: event - dict с httpMethod, body (multipart form data от Mailgun)
          context - объект с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    mailgun_api_key = os.environ.get('MAILGUN_API_KEY')
    if not mailgun_api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Mailgun API key not configured'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    signature_data = body_data.get('signature', {})
    token = signature_data.get('token', '')
    timestamp = signature_data.get('timestamp', '')
    signature = signature_data.get('signature', '')
    
    if not verify_mailgun_signature(token, timestamp, signature, mailgun_api_key):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid signature'})
        }
    
    sender = body_data.get('sender', '')
    recipient = body_data.get('recipient', '')
    subject = body_data.get('subject', '')
    body_plain = body_data.get('body-plain', '')
    body_html = body_data.get('body-html', body_plain)
    
    _, recipient_email = parseaddr(recipient)
    recipient_username = recipient_email.split('@')[0] if '@' in recipient_email else recipient_email
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            SELECT u.id FROM mail_users u
            WHERE u.username = %s
            """,
            (recipient_username,)
        )
        user_row = cursor.fetchone()
        
        if not user_row:
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'User not found, email discarded'})
            }
        
        user_id = user_row[0]
        
        cursor.execute(
            """
            SELECT id FROM mailboxes 
            WHERE user_id = %s AND name = 'Inbox'
            """,
            (user_id,)
        )
        inbox_row = cursor.fetchone()
        
        if not inbox_row:
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Inbox not found'})
            }
        
        mailbox_id = inbox_row[0]
        
        cursor.execute(
            """
            INSERT INTO emails (mailbox_id, from_address, to_address, subject, body, is_read, is_starred)
            VALUES (%s, %s, %s, %s, %s, false, false)
            RETURNING id
            """,
            (mailbox_id, sender, recipient, subject, body_html)
        )
        
        email_id = cursor.fetchone()[0]
        
        attachment_count = int(body_data.get('attachment-count', 0))
        if attachment_count > 0:
            for i in range(1, attachment_count + 1):
                attachment_key = f'attachment-{i}'
                if attachment_key in body_data:
                    attachment = body_data[attachment_key]
                    cursor.execute(
                        """
                        INSERT INTO attachments (email_id, filename, file_url, file_size, mime_type)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            email_id,
                            attachment.get('filename', 'unknown'),
                            attachment.get('url', ''),
                            attachment.get('size', 0),
                            attachment.get('content-type', 'application/octet-stream')
                        )
                    )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Email received', 'email_id': email_id})
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()
