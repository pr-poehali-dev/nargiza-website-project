-- Добавление уникального ограничения для автоматического обновления данных по месяцам
ALTER TABLE yandex_music_history 
ADD CONSTRAINT unique_month_year UNIQUE (month_name, year);