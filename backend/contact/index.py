import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправляет письма с формы обратной связи на указанный email
    Args: event - dict с httpMethod, body
          context - object с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    contact_req = ContactRequest(**body_data)
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    contact_email = os.environ.get('CONTACT_EMAIL')
    
    if not all([smtp_host, smtp_user, smtp_password, contact_email]):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Email configuration missing'})
        }
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новое сообщение от {contact_req.name}'
    msg['From'] = smtp_user
    msg['To'] = contact_email
    msg['Reply-To'] = contact_req.email
    
    text_content = f'''
Новое сообщение с сайта NARGIZA

От: {contact_req.name}
Email: {contact_req.email}

Сообщение:
{contact_req.message}
'''
    
    html_content = f'''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Новое сообщение с сайта NARGIZA</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>От:</strong> {contact_req.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:{contact_req.email}">{contact_req.email}</a></p>
        </div>
        <div style="margin-top: 20px;">
            <p style="margin: 5px 0 10px 0;"><strong>Сообщение:</strong></p>
            <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-left: 4px solid #2563eb;">{contact_req.message}</p>
        </div>
    </div>
</body>
</html>
'''
    
    msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Email sent successfully'})
        }
    except smtplib.SMTPAuthenticationError:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD'})
        }
    except smtplib.SMTPException as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'SMTP error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Failed to send email: {str(e)}'})
        }