import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создать подключение к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления Minecraft серверами
    GET / - получить список всех серверов с фильтрацией
    POST / - добавить новый сервер
    GET /:id - получить информацию о сервере
    PUT /:id/vote - проголосовать за сервер
    """
    method: str = event.get('httpMethod', 'GET')
    path_params = event.get('pathParams', {})
    query_params = event.get('queryStringParameters', {}) or {}
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET' and not path_params.get('id'):
            mode_filter = query_params.get('mode')
            search_query = query_params.get('search', '').lower()
            
            query = """
                SELECT id, name, ip, description, mode, version, 
                       players, max_players, rating, votes, owner, 
                       created_at, updated_at
                FROM servers
                WHERE 1=1
            """
            params = []
            
            if mode_filter and mode_filter != 'all':
                query += " AND LOWER(mode) = %s"
                params.append(mode_filter.lower())
            
            if search_query:
                query += " AND (LOWER(name) LIKE %s OR LOWER(description) LIKE %s)"
                search_pattern = f'%{search_query}%'
                params.extend([search_pattern, search_pattern])
            
            query += " ORDER BY (rating * votes) DESC, created_at DESC"
            
            cursor.execute(query, params)
            servers = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'servers': servers}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path_params.get('id'):
            server_id = path_params['id']
            
            cursor.execute("""
                SELECT id, name, ip, description, mode, version, 
                       players, max_players, rating, votes, owner,
                       created_at, updated_at
                FROM servers
                WHERE id = %s
            """, (server_id,))
            
            server = cursor.fetchone()
            
            if not server:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Сервер не найден'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'server': server}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            ip = body_data.get('ip', '').strip()
            description = body_data.get('description', '').strip()
            mode = body_data.get('mode', '').strip()
            version = body_data.get('version', '').strip()
            max_players = int(body_data.get('maxPlayers', 100))
            owner = body_data.get('owner', 'Anonymous')
            
            if not all([name, ip, mode, version]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                INSERT INTO servers (name, ip, description, mode, version, max_players, owner)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, ip, description, mode, version, players, max_players, 
                          rating, votes, owner, created_at, updated_at
            """, (name, ip, description, mode, version, max_players, owner))
            
            new_server = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'server': new_server}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and 'vote' in event.get('url', ''):
            server_id = path_params.get('id')
            body_data = json.loads(event.get('body', '{}'))
            rating_value = float(body_data.get('rating', 5.0))
            
            if rating_value < 1 or rating_value > 5:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Рейтинг должен быть от 1 до 5'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                UPDATE servers
                SET votes = votes + 1,
                    rating = ((rating * votes) + %s) / (votes + 1),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, rating, votes
            """, (rating_value, server_id))
            
            updated_server = cursor.fetchone()
            conn.commit()
            
            if not updated_server:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Сервер не найден'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'server': updated_server}, default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    except psycopg2.IntegrityError as e:
        conn.rollback()
        return {
            'statusCode': 409,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Сервер с таким IP уже существует'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
