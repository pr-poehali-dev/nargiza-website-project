import json
import os
import base64
import uuid
import boto3
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Загрузка вложений для писем в S3 хранилище
    Args: event - dict с httpMethod, body (base64 файлы)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с URL загруженных файлов
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        files = body_data.get('files', [])
        
        if not files:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No files provided'})
            }
        
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            region_name='ru-central1'
        )
        
        bucket_name = 'poehali-files'
        uploaded_files = []
        
        for file_data in files:
            filename = file_data.get('filename')
            content_base64 = file_data.get('content')
            mime_type = file_data.get('mime_type', 'application/octet-stream')
            
            if not filename or not content_base64:
                continue
            
            file_content = base64.b64decode(content_base64)
            file_id = str(uuid.uuid4())
            s3_key = f'mail-attachments/{file_id}/{filename}'
            
            s3_client.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=mime_type
            )
            
            file_url = f'https://cdn.poehali.dev/{s3_key}'
            
            uploaded_files.append({
                'filename': filename,
                'url': file_url,
                'size': len(file_content),
                'mime_type': mime_type
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'files': uploaded_files})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
