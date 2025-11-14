import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Админ-панель для управления почтовой системой
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    user_id = event.get('headers', {}).get('X-User-Id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT is_admin FROM mail_users WHERE id = %s", (int(user_id),))
        admin_check = cursor.fetchone()
        
        if not admin_check or not admin_check[0]:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied. Admin only.'})
            }
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'stats')
            
            if action == 'stats':
                cursor.execute("SELECT COUNT(*) FROM mail_users")
                total_users = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM mail_users WHERE is_active = true")
                active_users = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM emails")
                total_emails = cursor.fetchone()[0]
                
                cursor.execute("SELECT SUM(storage_used) FROM mail_users")
                total_storage = cursor.fetchone()[0] or 0
                
                cursor.execute("""
                    SELECT DATE(created_at), COUNT(*) 
                    FROM emails 
                    WHERE created_at > NOW() - INTERVAL '30 days'
                    GROUP BY DATE(created_at)
                    ORDER BY DATE(created_at) DESC
                    LIMIT 30
                """)
                email_activity = [{'date': str(row[0]), 'count': row[1]} for row in cursor.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'total_users': total_users,
                        'active_users': active_users,
                        'total_emails': total_emails,
                        'total_storage_mb': round(total_storage / 1024 / 1024, 2),
                        'email_activity': email_activity
                    })
                }
            
            elif action == 'users':
                cursor.execute("""
                    SELECT u.id, u.email, u.full_name, u.created_at, u.is_active, 
                           u.storage_used, u.storage_limit,
                           (SELECT COUNT(*) FROM emails WHERE from_user_id = u.id) as sent_count,
                           (SELECT COUNT(*) FROM emails WHERE to_user_id = u.id) as received_count
                    FROM mail_users u
                    ORDER BY u.created_at DESC
                """)
                
                users = []
                for row in cursor.fetchall():
                    users.append({
                        'id': row[0],
                        'email': row[1],
                        'full_name': row[2],
                        'created_at': row[3].isoformat(),
                        'is_active': row[4],
                        'storage_used_mb': round(row[5] / 1024 / 1024, 2),
                        'storage_limit_mb': round(row[6] / 1024 / 1024, 2),
                        'sent_count': row[7],
                        'received_count': row[8]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            target_user_id = body_data.get('user_id')
            
            if not target_user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'})
                }
            
            if action == 'toggle_active':
                cursor.execute(
                    "UPDATE mail_users SET is_active = NOT is_active WHERE id = %s RETURNING is_active",
                    (target_user_id,)
                )
                new_status = cursor.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'is_active': new_status})
                }
            
            elif action == 'update_storage':
                new_limit = body_data.get('storage_limit_mb', 1024)
                storage_bytes = new_limit * 1024 * 1024
                
                cursor.execute(
                    "UPDATE mail_users SET storage_limit = %s WHERE id = %s",
                    (storage_bytes, target_user_id)
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
