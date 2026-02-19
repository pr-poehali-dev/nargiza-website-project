CREATE TABLE forum_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) DEFAULT 'blue',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),
    posts_count INTEGER DEFAULT 0
);

CREATE INDEX idx_forum_users_username ON forum_users(username);

ALTER TABLE forum_messages ADD COLUMN user_id INTEGER REFERENCES forum_users(id);
ALTER TABLE forum_messages ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE forum_topics ADD COLUMN user_id INTEGER REFERENCES forum_users(id);