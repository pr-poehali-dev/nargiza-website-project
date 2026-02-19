import json
import os
import psycopg2
from datetime import datetime

def handler(event, context):
    """Форум — создание тем, сообщений, получение списка тем и последних сообщений"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'topics')

    if method == 'GET' and action == 'topics':
        page = int(params.get('page', '1'))
        limit = int(params.get('limit', '20'))
        offset = (page - 1) * limit

        cur.execute("SELECT COUNT(*) FROM forum_topics")
        total = cur.fetchone()[0]

        cur.execute(
            f"SELECT id, title, author_name, created_at, updated_at, is_pinned, replies_count, views_count "
            f"FROM forum_topics ORDER BY is_pinned DESC, updated_at DESC LIMIT {limit} OFFSET {offset}"
        )
        rows = cur.fetchall()
        topics = []
        for r in rows:
            topics.append({
                'id': r[0],
                'title': r[1],
                'author_name': r[2],
                'created_at': r[3].isoformat() if r[3] else None,
                'updated_at': r[4].isoformat() if r[4] else None,
                'is_pinned': r[5],
                'replies_count': r[6],
                'views_count': r[7]
            })

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'topics': topics, 'total': total, 'page': page})
        }

    if method == 'GET' and action == 'messages':
        topic_id = params.get('topic_id')
        if not topic_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'topic_id required'})}

        topic_id = int(topic_id)
        cur.execute(
            f"UPDATE forum_topics SET views_count = views_count + 1 WHERE id = {topic_id}"
        )
        conn.commit()

        cur.execute(
            f"SELECT id, title, author_name, created_at, is_pinned, replies_count, views_count "
            f"FROM forum_topics WHERE id = {topic_id}"
        )
        topic_row = cur.fetchone()
        if not topic_row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Topic not found'})}

        topic = {
            'id': topic_row[0],
            'title': topic_row[1],
            'author_name': topic_row[2],
            'created_at': topic_row[3].isoformat() if topic_row[3] else None,
            'is_pinned': topic_row[4],
            'replies_count': topic_row[5],
            'views_count': topic_row[6]
        }

        cur.execute(
            f"SELECT id, author_name, content, created_at FROM forum_messages "
            f"WHERE topic_id = {topic_id} ORDER BY created_at ASC"
        )
        msgs = cur.fetchall()
        messages = []
        for m in msgs:
            messages.append({
                'id': m[0],
                'author_name': m[1],
                'content': m[2],
                'created_at': m[3].isoformat() if m[3] else None
            })

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'topic': topic, 'messages': messages})
        }

    if method == 'GET' and action == 'latest':
        limit = int(params.get('limit', '5'))
        cur.execute(
            f"SELECT m.id, m.author_name, m.content, m.created_at, m.topic_id, t.title "
            f"FROM forum_messages m JOIN forum_topics t ON m.topic_id = t.id "
            f"ORDER BY m.created_at DESC LIMIT {limit}"
        )
        rows = cur.fetchall()
        messages = []
        for r in rows:
            messages.append({
                'id': r[0],
                'author_name': r[1],
                'content': r[2],
                'created_at': r[3].isoformat() if r[3] else None,
                'topic_id': r[4],
                'topic_title': r[5]
            })
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'messages': messages})
        }

    if method == 'POST' and action == 'create_topic':
        body = json.loads(event.get('body', '{}'))
        title = body.get('title', '').strip()
        author_name = body.get('author_name', '').strip()
        content = body.get('content', '').strip()

        if not title or not author_name or not content:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'title, author_name and content required'})}

        if len(title) > 255 or len(author_name) > 100 or len(content) > 5000:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Field too long'})}

        title_safe = title.replace("'", "''")
        author_safe = author_name.replace("'", "''")
        content_safe = content.replace("'", "''")

        cur.execute(
            f"INSERT INTO forum_topics (title, author_name) VALUES ('{title_safe}', '{author_safe}') RETURNING id"
        )
        topic_id = cur.fetchone()[0]

        cur.execute(
            f"INSERT INTO forum_messages (topic_id, author_name, content) "
            f"VALUES ({topic_id}, '{author_safe}', '{content_safe}') RETURNING id"
        )
        message_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()
        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({'topic_id': topic_id, 'message_id': message_id})
        }

    if method == 'POST' and action == 'check_admin':
        body = json.loads(event.get('body', '{}'))
        password = body.get('password', '')
        admin_password = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        is_valid = password == admin_password and admin_password != ''
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'is_admin': is_valid})
        }

    if method == 'POST' and action == 'delete_message':
        body = json.loads(event.get('body', '{}'))
        password = body.get('password', '')
        message_id = body.get('message_id')
        admin_password = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        if password != admin_password or admin_password == '':
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Forbidden'})}
        if not message_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'message_id required'})}
        message_id = int(message_id)
        cur.execute(f"SELECT topic_id FROM forum_messages WHERE id = {message_id}")
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Message not found'})}
        topic_id = row[0]
        cur.execute(f"SELECT MIN(id) FROM forum_messages WHERE topic_id = {topic_id}")
        first_msg = cur.fetchone()[0]
        if message_id == first_msg:
            cur.execute(f"UPDATE forum_messages SET content = '[сообщение удалено модератором]' WHERE id = {message_id}")
        else:
            cur.execute(f"UPDATE forum_messages SET content = '[сообщение удалено модератором]' WHERE id = {message_id}")
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'ok': True})
        }

    if method == 'POST' and action == 'delete_topic':
        body = json.loads(event.get('body', '{}'))
        password = body.get('password', '')
        topic_id = body.get('topic_id')
        admin_password = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        if password != admin_password or admin_password == '':
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Forbidden'})}
        if not topic_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'topic_id required'})}
        topic_id = int(topic_id)
        cur.execute(f"UPDATE forum_messages SET content = '[удалено]' WHERE topic_id = {topic_id}")
        cur.execute(f"UPDATE forum_topics SET title = '[тема удалена модератором]', replies_count = 0 WHERE id = {topic_id}")
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'ok': True})
        }

    if method == 'POST' and action == 'reply':
        body = json.loads(event.get('body', '{}'))
        topic_id = body.get('topic_id')
        author_name = body.get('author_name', '').strip()
        content = body.get('content', '').strip()

        if not topic_id or not author_name or not content:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'topic_id, author_name and content required'})}

        if len(author_name) > 100 or len(content) > 5000:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Field too long'})}

        topic_id = int(topic_id)
        author_safe = author_name.replace("'", "''")
        content_safe = content.replace("'", "''")

        cur.execute(f"SELECT id FROM forum_topics WHERE id = {topic_id}")
        if not cur.fetchone():
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Topic not found'})}

        cur.execute(
            f"INSERT INTO forum_messages (topic_id, author_name, content) "
            f"VALUES ({topic_id}, '{author_safe}', '{content_safe}') RETURNING id"
        )
        message_id = cur.fetchone()[0]

        cur.execute(
            f"UPDATE forum_topics SET replies_count = replies_count + 1, updated_at = NOW() WHERE id = {topic_id}"
        )
        conn.commit()

        cur.close()
        conn.close()
        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({'message_id': message_id})
        }

    cur.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Unknown action'})}