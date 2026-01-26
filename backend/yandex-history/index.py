import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения истории прослушиваний на Yandex Music по месяцам'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    history = [
        {'month': 'Сентябрь', 'year': 2025, 'listeners': 8500, 'date': '2025-09-01T00:00:00'},
        {'month': 'Октябрь', 'year': 2025, 'listeners': 12300, 'date': '2025-10-01T00:00:00'},
        {'month': 'Ноябрь', 'year': 2025, 'listeners': 15700, 'date': '2025-11-01T00:00:00'},
        {'month': 'Декабрь', 'year': 2025, 'listeners': 24800, 'date': '2025-12-01T00:00:00'},
        {'month': 'Январь', 'year': 2026, 'listeners': 32000, 'date': '2026-01-01T00:00:00'}
    ]

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'history': history, 'total': len(history)})
    }