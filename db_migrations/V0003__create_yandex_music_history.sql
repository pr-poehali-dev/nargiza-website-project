CREATE TABLE IF NOT EXISTS yandex_music_history (
    id SERIAL PRIMARY KEY,
    month_name VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    listeners INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month_name, year)
);

INSERT INTO yandex_music_history (month_name, year, listeners) VALUES
('Август', 2025, 145000),
('Сентябрь', 2025, 178000),
('Октябрь', 2025, 210000),
('Ноябрь', 2025, 245000),
('Декабрь', 2025, 280000),
('Январь', 2026, 330016)
ON CONFLICT (month_name, year) DO NOTHING;