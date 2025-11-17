-- Таблица категорий товаров
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    category_id INTEGER REFERENCES categories(id),
    image_url TEXT,
    badge VARCHAR(50),
    sizes VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица клиентов
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    payment_method VARCHAR(50),
    delivery_method VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров в заказе
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    size VARCHAR(20),
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Вставка начальных категорий
INSERT INTO categories (name, slug) VALUES
    ('Платья', 'dresses'),
    ('Блузы', 'blouses'),
    ('Брюки', 'pants'),
    ('Туники', 'tunics'),
    ('Костюмы', 'suits'),
    ('Кардиганы', 'cardigans');

-- Вставка тестовых товаров
INSERT INTO products (name, slug, description, price, old_price, category_id, image_url, badge, sizes) VALUES
    ('Платье "Элегант"', 'dress-elegant', 'Элегантное платье для особых случаев', 4990, 6990, 1, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', 'ХИТ', '50-62'),
    ('Блуза "Романтика"', 'blouse-romantic', 'Романтичная блуза на каждый день', 2990, NULL, 2, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', 'NEW', '50-60'),
    ('Брюки "Комфорт"', 'pants-comfort', 'Удобные брюки из натуральной ткани', 3490, 4990, 3, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', 'SALE', '48-64'),
    ('Туника "Весна"', 'tunic-spring', 'Легкая весенняя туника', 2790, NULL, 4, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', NULL, '52-62'),
    ('Костюм "Деловой"', 'suit-business', 'Деловой костюм для офиса', 6990, NULL, 5, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', 'NEW', '50-64'),
    ('Кардиган "Уют"', 'cardigan-cozy', 'Уютный кардиган для прохладных дней', 3990, 5490, 6, 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg', 'SALE', '48-62');