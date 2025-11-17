import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения списка товаров с фильтрацией
    Args: event - dict с httpMethod, queryStringParameters (category, size, search)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с JSON списком товаров
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        name = body_data.get('name')
        description = body_data.get('description')
        price = body_data.get('price')
        old_price = body_data.get('old_price')
        category = body_data.get('category')
        image_url = body_data.get('image_url')
        badge = body_data.get('badge')
        sizes = body_data.get('sizes')
        
        if not name or not price or not category:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        slug = name.lower().replace(' ', '-').replace('"', '')
        
        cursor.execute('''
            SELECT id FROM categories WHERE name = %s
        ''', (category,))
        category_result = cursor.fetchone()
        category_id = category_result['id'] if category_result else None
        
        cursor.execute('''
            INSERT INTO products (name, slug, description, price, old_price, category_id, image_url, badge, sizes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (name, slug, description, price, old_price, category_id, image_url, badge, sizes))
        
        product_id = cursor.fetchone()['id']
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'product_id': product_id, 'message': 'Product created successfully'})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        
        product_id = body_data.get('id')
        is_active = body_data.get('is_active')
        
        if product_id is None:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing product id'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE products 
            SET is_active = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
        ''', (is_active, product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'message': 'Product updated successfully'})
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    category = params.get('category')
    size = params.get('size')
    search = params.get('search')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    query = '''
        SELECT 
            p.id, p.name, p.slug, p.description, p.price, p.old_price,
            p.image_url, p.badge, p.sizes, c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
    '''
    
    conditions = []
    
    if category and category != 'Все':
        conditions.append(f"c.name = '{category}'")
    
    if size and size != 'Все':
        conditions.append(f"p.sizes LIKE '%{size}%'")
    
    if search:
        conditions.append(f"(p.name ILIKE '%{search}%' OR p.description ILIKE '%{search}%')")
    
    if conditions:
        query += ' AND ' + ' AND '.join(conditions)
    
    query += ' ORDER BY p.created_at DESC'
    
    cursor.execute(query)
    products = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    def decimal_to_float(obj):
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError
    
    products_list = [dict(row) for row in products]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'products': products_list}, ensure_ascii=False, default=decimal_to_float)
    }