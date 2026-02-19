import json
import os
import hashlib
import secrets
import psycopg2

def hash_password(password, salt=None):
    """Хеширование пароля с солью"""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password, stored):
    """Проверка пароля"""
    salt = stored.split(':')[0]
    return hash_password(password, salt) == stored

def handler(event, context):
    """Форум с регистрацией — темы, сообщения, пользователи, модерация"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    db = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db)
    cur = conn.cursor()
    H = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'topics')
    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Auth-Token') or headers_in.get('x-auth-token') or ''

    def get_user_by_token(t):
        if not t:
            return None
        cur.execute(f"SELECT id, username, display_name, is_admin, avatar_color, posts_count FROM forum_users WHERE id::text || ':' || password_hash = '{t.replace(chr(39), chr(39)+chr(39))}'")
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'username': row[1], 'display_name': row[2], 'is_admin': row[3], 'avatar_color': row[4], 'posts_count': row[5]}
        parts = t.split(':')
        if len(parts) >= 2:
            uid = parts[0]
            cur.execute(f"SELECT id, username, display_name, is_admin, avatar_color, posts_count, password_hash FROM forum_users WHERE id = {int(uid)}")
            row = cur.fetchone()
            if row:
                full_token = str(row[0]) + ':' + row[6]
                if full_token == t:
                    return {'id': row[0], 'username': row[1], 'display_name': row[2], 'is_admin': row[3], 'avatar_color': row[4], 'posts_count': row[5]}
        return None

    def resp(code, body):
        cur.close()
        conn.close()
        return {'statusCode': code, 'headers': H, 'body': json.dumps(body, default=str)}

    # --- РЕГИСТРАЦИЯ ---
    if method == 'POST' and action == 'register':
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip().lower()
        password = body.get('password', '').strip()
        display_name = body.get('display_name', '').strip()

        if not username or not password or not display_name:
            return resp(400, {'error': 'Заполните все поля'})
        if len(username) < 3 or len(username) > 30:
            return resp(400, {'error': 'Логин от 3 до 30 символов'})
        if len(password) < 4:
            return resp(400, {'error': 'Пароль минимум 4 символа'})
        if len(display_name) > 50:
            return resp(400, {'error': 'Имя до 50 символов'})

        username_safe = username.replace("'", "''")
        cur.execute(f"SELECT id FROM forum_users WHERE username = '{username_safe}'")
        if cur.fetchone():
            return resp(400, {'error': 'Такой логин уже занят'})

        pw_hash = hash_password(password)
        display_safe = display_name.replace("'", "''")
        colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'teal']
        color = colors[hash(username) % len(colors)]

        cur.execute(
            f"INSERT INTO forum_users (username, password_hash, display_name, avatar_color) "
            f"VALUES ('{username_safe}', '{pw_hash}', '{display_safe}', '{color}') RETURNING id"
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        token_val = f"{user_id}:{pw_hash}"
        return resp(201, {'user_id': user_id, 'token': token_val, 'display_name': display_name, 'is_admin': False})

    # --- ВХОД ---
    if method == 'POST' and action == 'login':
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip().lower()
        password = body.get('password', '').strip()

        if not username or not password:
            return resp(400, {'error': 'Заполните все поля'})

        username_safe = username.replace("'", "''")
        cur.execute(f"SELECT id, password_hash, display_name, is_admin, avatar_color, posts_count FROM forum_users WHERE username = '{username_safe}'")
        row = cur.fetchone()
        if not row or not verify_password(password, row[1]):
            return resp(401, {'error': 'Неверный логин или пароль'})

        cur.execute(f"UPDATE forum_users SET last_seen = NOW() WHERE id = {row[0]}")
        conn.commit()
        token_val = f"{row[0]}:{row[1]}"
        return resp(200, {'user_id': row[0], 'token': token_val, 'display_name': row[2], 'is_admin': row[3], 'avatar_color': row[4], 'posts_count': row[5]})

    # --- ПРОВЕРКА ТОКЕНА ---
    if method == 'GET' and action == 'me':
        user = get_user_by_token(token)
        if not user:
            return resp(401, {'error': 'Не авторизован'})
        return resp(200, user)

    # --- СПИСОК ТЕМ ---
    if method == 'GET' and action == 'topics':
        page = int(params.get('page', '1'))
        limit = min(int(params.get('limit', '20')), 50)
        offset = (page - 1) * limit

        cur.execute("SELECT COUNT(*) FROM forum_topics WHERE is_hidden = FALSE")
        total = cur.fetchone()[0]

        cur.execute(
            f"SELECT t.id, t.title, t.author_name, t.created_at, t.updated_at, t.is_pinned, t.replies_count, t.views_count, "
            f"COALESCE(u.display_name, t.author_name), COALESCE(u.avatar_color, 'blue') "
            f"FROM forum_topics t LEFT JOIN forum_users u ON t.user_id = u.id "
            f"WHERE t.is_hidden = FALSE ORDER BY t.is_pinned DESC, t.updated_at DESC LIMIT {limit} OFFSET {offset}"
        )
        topics = []
        for r in cur.fetchall():
            topics.append({
                'id': r[0], 'title': r[1], 'author_name': r[8] or r[2],
                'created_at': r[3], 'updated_at': r[4], 'is_pinned': r[5],
                'replies_count': r[6], 'views_count': r[7], 'avatar_color': r[9]
            })
        return resp(200, {'topics': topics, 'total': total, 'page': page})

    # --- СООБЩЕНИЯ ТЕМЫ ---
    if method == 'GET' and action == 'messages':
        topic_id = params.get('topic_id')
        if not topic_id:
            return resp(400, {'error': 'topic_id required'})
        topic_id = int(topic_id)

        cur.execute(f"UPDATE forum_topics SET views_count = views_count + 1 WHERE id = {topic_id}")
        conn.commit()

        cur.execute(
            f"SELECT t.id, t.title, t.author_name, t.created_at, t.is_pinned, t.replies_count, t.views_count, "
            f"COALESCE(u.display_name, t.author_name) "
            f"FROM forum_topics t LEFT JOIN forum_users u ON t.user_id = u.id WHERE t.id = {topic_id}"
        )
        tr = cur.fetchone()
        if not tr:
            return resp(404, {'error': 'Тема не найдена'})

        topic_data = {
            'id': tr[0], 'title': tr[1], 'author_name': tr[7] or tr[2],
            'created_at': tr[3], 'is_pinned': tr[4], 'replies_count': tr[5], 'views_count': tr[6]
        }

        cur.execute(
            f"SELECT m.id, m.author_name, m.content, m.created_at, m.user_id, "
            f"COALESCE(u.display_name, m.author_name), COALESCE(u.avatar_color, 'blue'), COALESCE(u.posts_count, 0) "
            f"FROM forum_messages m LEFT JOIN forum_users u ON m.user_id = u.id "
            f"WHERE m.topic_id = {topic_id} AND m.is_hidden = FALSE ORDER BY m.created_at ASC"
        )
        messages = []
        for m in cur.fetchall():
            messages.append({
                'id': m[0], 'author_name': m[5] or m[1], 'content': m[2],
                'created_at': m[3], 'user_id': m[4], 'avatar_color': m[6], 'posts_count': m[7]
            })
        return resp(200, {'topic': topic_data, 'messages': messages})

    # --- ПОСЛЕДНИЕ СООБЩЕНИЯ ---
    if method == 'GET' and action == 'latest':
        limit = min(int(params.get('limit', '5')), 20)
        cur.execute(
            f"SELECT m.id, COALESCE(u.display_name, m.author_name), m.content, m.created_at, m.topic_id, t.title, "
            f"COALESCE(u.avatar_color, 'blue') "
            f"FROM forum_messages m JOIN forum_topics t ON m.topic_id = t.id "
            f"LEFT JOIN forum_users u ON m.user_id = u.id "
            f"WHERE t.is_hidden = FALSE AND m.is_hidden = FALSE ORDER BY m.created_at DESC LIMIT {limit}"
        )
        messages = []
        for r in cur.fetchall():
            messages.append({
                'id': r[0], 'author_name': r[1], 'content': r[2],
                'created_at': r[3], 'topic_id': r[4], 'topic_title': r[5], 'avatar_color': r[6]
            })
        return resp(200, {'messages': messages})

    # --- СОЗДАТЬ ТЕМУ ---
    if method == 'POST' and action == 'create_topic':
        user = get_user_by_token(token)
        if not user:
            return resp(401, {'error': 'Войдите или зарегистрируйтесь'})

        body = json.loads(event.get('body', '{}'))
        title = body.get('title', '').strip()
        content = body.get('content', '').strip()

        if not title or not content:
            return resp(400, {'error': 'Заполните заголовок и сообщение'})
        if len(title) > 255 or len(content) > 5000:
            return resp(400, {'error': 'Слишком длинный текст'})

        title_safe = title.replace("'", "''")
        content_safe = content.replace("'", "''")
        name_safe = user['display_name'].replace("'", "''")

        cur.execute(
            f"INSERT INTO forum_topics (title, author_name, user_id) "
            f"VALUES ('{title_safe}', '{name_safe}', {user['id']}) RETURNING id"
        )
        tid = cur.fetchone()[0]
        cur.execute(
            f"INSERT INTO forum_messages (topic_id, author_name, content, user_id) "
            f"VALUES ({tid}, '{name_safe}', '{content_safe}', {user['id']})"
        )
        cur.execute(f"UPDATE forum_users SET posts_count = posts_count + 1 WHERE id = {user['id']}")
        conn.commit()
        return resp(201, {'topic_id': tid})

    # --- ОТВЕТИТЬ ---
    if method == 'POST' and action == 'reply':
        user = get_user_by_token(token)
        if not user:
            return resp(401, {'error': 'Войдите или зарегистрируйтесь'})

        body = json.loads(event.get('body', '{}'))
        topic_id = body.get('topic_id')
        content = body.get('content', '').strip()

        if not topic_id or not content:
            return resp(400, {'error': 'Заполните сообщение'})
        if len(content) > 5000:
            return resp(400, {'error': 'Слишком длинный текст'})

        topic_id = int(topic_id)
        content_safe = content.replace("'", "''")
        name_safe = user['display_name'].replace("'", "''")

        cur.execute(f"SELECT id FROM forum_topics WHERE id = {topic_id} AND is_hidden = FALSE")
        if not cur.fetchone():
            return resp(404, {'error': 'Тема не найдена'})

        cur.execute(
            f"INSERT INTO forum_messages (topic_id, author_name, content, user_id) "
            f"VALUES ({topic_id}, '{name_safe}', '{content_safe}', {user['id']})"
        )
        cur.execute(f"UPDATE forum_topics SET replies_count = replies_count + 1, updated_at = NOW() WHERE id = {topic_id}")
        cur.execute(f"UPDATE forum_users SET posts_count = posts_count + 1 WHERE id = {user['id']}")
        conn.commit()
        return resp(201, {'ok': True})

    # --- УДАЛИТЬ СООБЩЕНИЕ (модератор) ---
    if method == 'POST' and action == 'delete_message':
        user = get_user_by_token(token)
        admin_pwd = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        body = json.loads(event.get('body', '{}'))
        msg_id = body.get('message_id')

        is_mod = (user and user['is_admin']) or (body.get('password') == admin_pwd and admin_pwd)
        if not is_mod:
            return resp(403, {'error': 'Нет доступа'})
        if not msg_id:
            return resp(400, {'error': 'message_id required'})

        cur.execute(f"UPDATE forum_messages SET is_hidden = TRUE WHERE id = {int(msg_id)}")
        conn.commit()
        return resp(200, {'ok': True})

    # --- УДАЛИТЬ ТЕМУ (модератор) ---
    if method == 'POST' and action == 'delete_topic':
        user = get_user_by_token(token)
        admin_pwd = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        body = json.loads(event.get('body', '{}'))
        tid = body.get('topic_id')

        is_mod = (user and user['is_admin']) or (body.get('password') == admin_pwd and admin_pwd)
        if not is_mod:
            return resp(403, {'error': 'Нет доступа'})
        if not tid:
            return resp(400, {'error': 'topic_id required'})

        cur.execute(f"UPDATE forum_topics SET is_hidden = TRUE WHERE id = {int(tid)}")
        conn.commit()
        return resp(200, {'ok': True})

    # --- ПРОВЕРКА АДМИН-ПАРОЛЯ ---
    if method == 'POST' and action == 'check_admin':
        body = json.loads(event.get('body', '{}'))
        pwd = body.get('password', '')
        admin_pwd = os.environ.get('FORUM_ADMIN_PASSWORD', '')
        return resp(200, {'is_admin': pwd == admin_pwd and admin_pwd != ''})

    return resp(400, {'error': 'Неизвестное действие'})
