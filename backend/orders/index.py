import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для создания и управления заказами
    Args: event - dict с httpMethod, body (для POST), queryStringParameters (для GET)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными заказа или списком заказов
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
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        order_id = params.get('id')
        status = params.get('status')
        
        if order_id:
            cursor.execute('''
                SELECT o.*, 
                    json_agg(json_build_object(
                        'id', oi.id,
                        'product_name', oi.product_name,
                        'product_price', oi.product_price,
                        'size', oi.size,
                        'quantity', oi.quantity,
                        'subtotal', oi.subtotal
                    )) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.id = %s
                GROUP BY o.id
            ''' % order_id)
            order = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if not order:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Order not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'order': dict(order)}, ensure_ascii=False, default=str)
            }
        
        query = 'SELECT * FROM orders WHERE 1=1'
        if status:
            query += f" AND status = '{status}'"
        query += ' ORDER BY created_at DESC LIMIT 100'
        
        cursor.execute(query)
        orders = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'orders': [dict(row) for row in orders]}, ensure_ascii=False, default=str)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        customer_name = body_data.get('customer_name')
        customer_phone = body_data.get('customer_phone')
        customer_email = body_data.get('customer_email')
        delivery_address = body_data.get('delivery_address')
        payment_method = body_data.get('payment_method')
        delivery_method = body_data.get('delivery_method')
        comment = body_data.get('comment')
        items = body_data.get('items', [])
        
        if not customer_name or not customer_phone or not items:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        total_amount = sum(item.get('subtotal', 0) for item in items)
        
        cursor.execute('''
            INSERT INTO orders (
                customer_name, customer_phone, customer_email, 
                delivery_address, payment_method, delivery_method,
                comment, total_amount, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            customer_name, customer_phone, customer_email,
            delivery_address, payment_method, delivery_method,
            comment, total_amount, 'new'
        ))
        
        order_id = cursor.fetchone()['id']
        
        for item in items:
            cursor.execute('''
                INSERT INTO order_items (
                    order_id, product_id, product_name, 
                    product_price, size, quantity, subtotal
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                order_id, item.get('product_id'), item.get('product_name'),
                item.get('product_price'), item.get('size'), 
                item.get('quantity', 1), item.get('subtotal')
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'order_id': order_id, 'message': 'Order created successfully'})
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        order_id = body_data.get('id')
        status = body_data.get('status')
        
        if not order_id or not status:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Missing order id or status'})
            }
        
        cursor.execute('''
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
        ''', (status, order_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'message': 'Order updated successfully'})
        }
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
