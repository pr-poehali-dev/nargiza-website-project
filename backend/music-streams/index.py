import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для получения и обновления статистики прослушиваний на музыкальных платформах'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method == 'GET':
        result = {
            'yandex': {
                'streams': 52000,
                'updated_at': datetime.now().isoformat()
            },
            'spotify': {
                'streams': 28300,
                'updated_at': datetime.now().isoformat()
            },
            'apple': {
                'streams': 16700,
                'updated_at': datetime.now().isoformat()
            }
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }