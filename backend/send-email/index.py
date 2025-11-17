import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка email уведомлений о заказах
    Args: event - dict с httpMethod, body (to, subject, html, text)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатом отправки
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    to_email = body_data.get('to')
    subject = body_data.get('subject')
    html_content = body_data.get('html')
    text_content = body_data.get('text', '')
    
    if not to_email or not subject or not html_content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Missing required fields: to, subject, html'})
        }
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_host or not smtp_user or not smtp_password:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'SMTP configuration is missing'})
        }
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email
    
    if text_content:
        part_text = MIMEText(text_content, 'plain', 'utf-8')
        msg.attach(part_text)
    
    part_html = MIMEText(html_content, 'html', 'utf-8')
    msg.attach(part_html)
    
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.quit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'message': 'Email sent successfully'})
    }
