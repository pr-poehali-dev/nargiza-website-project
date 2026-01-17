# Настройка автоматического обновления статистики

## Что это?
Автоматическое обновление статистики прослушиваний с Yandex Music каждые 24 часа.

## Шаг 1: Добавить секретный токен

1. В интерфейсе poehali.dev добавьте секрет `STATS_CRON_TOKEN`
2. Придумайте случайный токен (например: `my-secret-token-2026-xyz`)
3. Сохраните этот токен - он понадобится дальше

## Шаг 2: Настроить cron-job.org (бесплатно)

### Вариант A: Через cron-job.org

1. Зайдите на https://cron-job.org/en/
2. Создайте бесплатный аккаунт
3. Нажмите "Create cronjob"
4. Заполните форму:
   - **Title:** Yandex Music Stats Update
   - **URL:** `https://functions.poehali.dev/6216c52f-7243-4dcd-8c37-45841228c5e1`
   - **Schedule:** Every day at 03:00 (или любое другое время)
   - **Request method:** GET
5. Добавьте HTTP Header:
   - **Key:** `X-Cron-Token`
   - **Value:** ваш токен из Шага 1
6. Сохраните

### Вариант B: Через UptimeRobot (бесплатно)

1. Зайдите на https://uptimerobot.com
2. Создайте аккаунт
3. Создайте новый Monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Yandex Stats Parser
   - **URL:** `https://functions.poehali.dev/6216c52f-7243-4dcd-8c37-45841228c5e1`
   - **Monitoring Interval:** Every 24 hours
4. В Advanced Settings добавьте Custom HTTP Header:
   ```
   X-Cron-Token: ваш_токен
   ```
5. Save Monitor

### Вариант C: Через GitHub Actions (для разработчиков)

Если ваш проект подключен к GitHub, создайте файл `.github/workflows/update-stats.yml`:

```yaml
name: Update Yandex Music Stats

on:
  schedule:
    - cron: '0 3 * * *'  # Каждый день в 03:00 UTC
  workflow_dispatch:  # Можно запустить вручную

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - name: Call stats parser
        run: |
          curl -X GET \
            -H "X-Cron-Token: ${{ secrets.STATS_CRON_TOKEN }}" \
            https://functions.poehali.dev/6216c52f-7243-4dcd-8c37-45841228c5e1
```

Затем добавьте секрет в GitHub:
- Settings → Secrets and variables → Actions
- New repository secret: `STATS_CRON_TOKEN` = ваш токен

## Проверка работы

Через 24 часа после настройки проверьте, обновилась ли статистика на сайте.

Если что-то не работает:
1. Проверьте, что токен в cron-сервисе совпадает с токеном в poehali.dev
2. Проверьте логи функции в poehali.dev
3. Убедитесь, что заголовок называется точно `X-Cron-Token` (с заглавными буквами)

## Безопасность

- Никому не показывайте ваш токен
- Без токена парсер работать не будет (защита от перегрузки)
- Можно в любой момент изменить токен в настройках
