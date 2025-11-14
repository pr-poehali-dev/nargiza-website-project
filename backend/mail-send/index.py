import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка реальных email через SMTP-сервер
    Args: event - dict с httpMethod, body (to, subject, body, attachments)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с результатом отправки
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    database_url = os.environ.get('DATABASE_URL')
    
    if not all([smtp_host, smtp_user, smtp_password, database_url]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'SMTP or database not configured'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        to_address = body_data.get('to')
        subject = body_data.get('subject', '')
        body_text = body_data.get('body', '')
        attachments = body_data.get('attachments', [])
        
        if not to_address:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Recipient email required'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT email, full_name FROM mail_users WHERE id = %s",
            (int(user_id),)
        )
        user_data = cursor.fetchone()
        from_email = user_data[0]
        from_name = user_data[1] or from_email
        
        msg = MIMEMultipart()
        msg['From'] = f"{from_name} <{smtp_user}>"
        msg['To'] = to_address
        msg['Subject'] = subject
        msg['Reply-To'] = from_email
        
        msg.attach(MIMEText(body_text, 'plain', 'utf-8'))
        
        for attachment in attachments:
            file_url = attachment.get('url')
            filename = attachment.get('filename')
            
            if file_url and filename:
                response = requests.get(file_url, timeout=10)
                if response.status_code == 200:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(response.content)
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', f'attachment; filename={filename}')
                    msg.attach(part)
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        cursor.execute(
            "SELECT id FROM mailboxes WHERE user_id = %s AND name = 'Sent'",
            (int(user_id),)
        )
        sent_mailbox = cursor.fetchone()
        
        if sent_mailbox:
            cursor.execute(
                """
                INSERT INTO emails (mailbox_id, from_address, to_address, subject, body)
                VALUES (%s, %s, %s, %s, %s) RETURNING id
                """,
                (sent_mailbox[0], from_email, to_address, subject, body_text)
            )
            email_id = cursor.fetchone()[0]
            
            for attachment in attachments:
                cursor.execute(
                    """
                    INSERT INTO attachments (email_id, filename, file_url, file_size, mime_type)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        email_id,
                        attachment.get('filename'),
                        attachment.get('url'),
                        attachment.get('size'),
                        attachment.get('mime_type')
                    )
                )
            
            conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Email sent successfully'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
