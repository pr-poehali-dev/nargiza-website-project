CREATE TABLE forum_topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0
);

CREATE TABLE forum_messages (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forum_messages_topic_id ON forum_messages(topic_id);
CREATE INDEX idx_forum_messages_created_at ON forum_messages(created_at DESC);
CREATE INDEX idx_forum_topics_updated_at ON forum_topics(updated_at DESC);