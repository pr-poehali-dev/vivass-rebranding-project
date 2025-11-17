import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime
import urllib.request
import urllib.parse

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
        
        send_order_emails(order_id, customer_name, customer_email, customer_phone, total_amount, items)
        
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

def send_order_emails(order_id: int, customer_name: str, customer_email: str, customer_phone: str, total_amount: float, items: list):
    admin_email = os.environ.get('ADMIN_EMAIL')
    email_function_url = 'https://functions.poehali.dev/send-email'
    
    items_html = ''.join([
        f'<tr><td>{item.get("product_name")}</td><td>{item.get("size", "-")}</td><td>{item.get("quantity")}</td><td>{item.get("product_price")} ₽</td><td>{item.get("subtotal")} ₽</td></tr>'
        for item in items
    ])
    
    if admin_email:
        admin_html = f'''
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4A90E2;">Новый заказ #{order_id}</h2>
            <p><strong>Клиент:</strong> {customer_name}</p>
            <p><strong>Телефон:</strong> {customer_phone}</p>
            <p><strong>Email:</strong> {customer_email or "не указан"}</p>
            <h3>Товары:</h3>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Товар</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Размер</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Кол-во</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Цена</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Сумма</th>
                    </tr>
                </thead>
                <tbody>{items_html}</tbody>
            </table>
            <h3>Итого: {total_amount} ₽</h3>
        </body>
        </html>
        '''
        
        admin_data = json.dumps({
            'to': admin_email,
            'subject': f'Новый заказ #{order_id} на сайте VIVASS',
            'html': admin_html
        }).encode('utf-8')
        
        admin_req = urllib.request.Request(
            email_function_url,
            data=admin_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            urllib.request.urlopen(admin_req)
        except Exception:
            pass
    
    if customer_email:
        customer_html = f'''
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4A90E2;">Спасибо за заказ, {customer_name}!</h2>
            <p>Ваш заказ <strong>#{order_id}</strong> успешно оформлен.</p>
            <p>Мы свяжемся с вами в ближайшее время для подтверждения.</p>
            <h3>Детали заказа:</h3>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Товар</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Размер</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Кол-во</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Цена</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Сумма</th>
                    </tr>
                </thead>
                <tbody>{items_html}</tbody>
            </table>
            <h3>Итого: {total_amount} ₽</h3>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #777; font-size: 12px;">Это автоматическое письмо, отвечать на него не нужно.</p>
        </body>
        </html>
        '''
        
        customer_data = json.dumps({
            'to': customer_email,
            'subject': f'Ваш заказ #{order_id} в магазине VIVASS',
            'html': customer_html
        }).encode('utf-8')
        
        customer_req = urllib.request.Request(
            email_function_url,
            data=customer_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            urllib.request.urlopen(customer_req)
        except Exception:
            pass