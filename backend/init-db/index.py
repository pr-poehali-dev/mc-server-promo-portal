import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Инициализация базы данных для Minecraft серверов
    Создает таблицу servers и добавляет начальные данные
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Только POST запросы'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS servers (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              ip VARCHAR(255) NOT NULL UNIQUE,
              description TEXT,
              mode VARCHAR(50) NOT NULL,
              version VARCHAR(20) NOT NULL,
              players INTEGER DEFAULT 0,
              max_players INTEGER DEFAULT 100,
              rating DECIMAL(3, 1) DEFAULT 0.0,
              votes INTEGER DEFAULT 0,
              owner VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_servers_mode ON servers(mode)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_servers_rating ON servers(rating DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at DESC)
        """)
        
        cursor.execute("SELECT COUNT(*) FROM servers")
        count = cursor.fetchone()[0]
        
        if count == 0:
            initial_servers = [
                ("SkyBlock Heaven", "sky.heaven.ru:25565", "Лучший SkyBlock сервер с уникальными островами и крафтами", 
                 "SkyBlock", "1.20.1", 487, 1000, 4.8, 2340, "Admin1"),
                ("CraftWars PvP", "wars.craft.net:25565", "Хардкорный PvP с кланами, рейдами и эпичными битвами", 
                 "PvP", "1.19.4", 312, 500, 4.6, 1820, "Admin2"),
                ("Survival Master", "survival.pro:19132", "Классический выживание с экономикой и привилегиями", 
                 "Survival", "1.20.2", 156, 300, 4.7, 980, "Admin3"),
                ("MiniGames Paradise", "mini.paradise.com:25565", "50+ мини-игр, турниры каждый день, уникальные режимы", 
                 "MiniGames", "1.20.1", 623, 1500, 4.9, 3120, "Admin4")
            ]
            
            cursor.executemany("""
                INSERT INTO servers (name, ip, description, mode, version, players, max_players, rating, votes, owner)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, initial_servers)
        
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) FROM servers")
        total_servers = cursor.fetchone()[0]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'База данных инициализирована',
                'totalServers': total_servers
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
