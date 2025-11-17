import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    const response = await fetch('https://functions.poehali.dev/68a49b74-7604-4ba7-88e4-b850c9f8620e');
    const data = await response.json();
    setProducts(data.products);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const response = await fetch('https://functions.poehali.dev/228e7b4d-7205-4b2b-b62d-481754385663');
    const data = await response.json();
    setOrders(data.orders);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    await fetch('https://functions.poehali.dev/228e7b4d-7205-4b2b-b62d-481754385663', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status })
    });
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      new: { label: 'Новый', className: 'bg-blue-500' },
      processing: { label: 'В обработке', className: 'bg-yellow-500' },
      shipped: { label: 'Отправлен', className: 'bg-purple-500' },
      delivered: { label: 'Доставлен', className: 'bg-green-500' },
      cancelled: { label: 'Отменён', className: 'bg-red-500' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
    return <Badge className={`${config.className} text-white`}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
              <Icon name="Shield" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              VIVASS Admin
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На сайт
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('adminAuth');
                window.location.href = '/login';
              }}
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="products">
              <Icon name="Package" size={16} className="mr-2" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Icon name="ShoppingCart" size={16} className="mr-2" />
              Заказы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
              <h2 className="text-3xl font-bold">Управление товарами</h2>
              <div className="flex gap-2">
                <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon name="Upload" size={16} className="mr-2" />
                      Массовая загрузка
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Массовая загрузка товаров</DialogTitle>
                      <DialogDescription>
                        Вставьте данные в формате JSON. Пример:<br/>
                        <code className="text-xs block mt-2 p-2 bg-muted rounded">
                          [{`{"name": "Платье летнее", "price": 2990, "category": "Платья", "sizes": "48-60", "image_url": "...", "description": "...", "badge": "NEW"}`}]
                        </code>
                      </DialogDescription>
                    </DialogHeader>
                    <BulkUploadForm 
                      bulkData={bulkData}
                      setBulkData={setBulkData}
                      bulkLoading={bulkLoading}
                      onSubmit={async () => {
                        setBulkLoading(true);
                        try {
                          const items = JSON.parse(bulkData);
                          if (!Array.isArray(items)) {
                            alert('Данные должны быть массивом');
                            setBulkLoading(false);
                            return;
                          }
                          
                          let successCount = 0;
                          let errorCount = 0;
                          
                          for (const item of items) {
                            try {
                              const response = await fetch('https://functions.poehali.dev/68a49b74-7604-4ba7-88e4-b850c9f8620e', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(item)
                              });
                              
                              if (response.ok) {
                                successCount++;
                              } else {
                                errorCount++;
                              }
                            } catch (err) {
                              errorCount++;
                            }
                          }
                          
                          alert(`Загружено: ${successCount}, Ошибок: ${errorCount}`);
                          setBulkData('');
                          setIsBulkUploadOpen(false);
                          fetchProducts();
                        } catch (err) {
                          alert('Ошибка парсинга JSON: ' + (err as Error).message);
                        }
                        setBulkLoading(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить товар
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Добавить новый товар</DialogTitle>
                      <DialogDescription>Заполните информацию о товаре</DialogDescription>
                    </DialogHeader>
                    <ProductForm onSuccess={() => { setIsDialogOpen(false); fetchProducts(); }} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any) => (
                  <Card key={product.id} className="group hover:border-primary transition-all">
                    <CardHeader>
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </div>
                        {product.badge && (
                          <Badge>{product.badge}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Цена:</span>
                          <span className="font-semibold">{product.price} ₽</span>
                        </div>
                        {product.old_price && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Старая цена:</span>
                            <span className="line-through">{product.old_price} ₽</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Размеры:</span>
                          <span>{product.sizes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Статус:</span>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Icon name="Pencil" size={14} className="mr-1" />
                          Изменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Управление заказами</h2>
              <p className="text-muted-foreground mt-2">Всего заказов: {orders.length}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order.id} className="hover:border-primary transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={16} className="text-muted-foreground" />
                            <span className="font-semibold">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={16} className="text-muted-foreground" />
                            <span>{order.customer_phone}</span>
                          </div>
                          {order.customer_email && (
                            <div className="flex items-center gap-2">
                              <Icon name="Mail" size={16} className="text-muted-foreground" />
                              <span>{order.customer_email}</span>
                            </div>
                          )}
                          {order.delivery_address && (
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={16} className="text-muted-foreground" />
                              <span className="text-sm">{order.delivery_address}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Сумма заказа:</span>
                            <span className="font-bold text-lg">{order.total_amount} ₽</span>
                          </div>
                          {order.payment_method && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Оплата:</span>
                              <span>{order.payment_method}</span>
                            </div>
                          )}
                          {order.delivery_method && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Доставка:</span>
                              <span>{order.delivery_method}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {order.comment && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm"><strong>Комментарий:</strong> {order.comment}</p>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant={order.status === 'new' ? 'default' : 'outline'}
                          onClick={() => updateOrderStatus(order.id, 'new')}
                        >
                          Новый
                        </Button>
                        <Button 
                          size="sm" 
                          variant={order.status === 'processing' ? 'default' : 'outline'}
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                        >
                          В обработке
                        </Button>
                        <Button 
                          size="sm" 
                          variant={order.status === 'shipped' ? 'default' : 'outline'}
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                        >
                          Отправлен
                        </Button>
                        <Button 
                          size="sm" 
                          variant={order.status === 'delivered' ? 'default' : 'outline'}
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                        >
                          Доставлен
                        </Button>
                        <Button 
                          size="sm" 
                          variant={order.status === 'cancelled' ? 'destructive' : 'outline'}
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Отменён
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const BulkUploadForm = ({ bulkData, setBulkData, bulkLoading, onSubmit }: any) => {
  return (
    <div className="space-y-4">
      <Textarea 
        value={bulkData}
        onChange={(e) => setBulkData(e.target.value)}
        placeholder="Вставьте JSON с массивом товаров..."
        className="min-h-[400px] font-mono text-sm"
      />
      <Button 
        onClick={onSubmit}
        disabled={bulkLoading || !bulkData}
        className="w-full bg-gradient-to-r from-primary to-secondary"
      >
        {bulkLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Загрузка...
          </>
        ) : (
          <>
            <Icon name="Upload" size={16} className="mr-2" />
            Загрузить товары
          </>
        )}
      </Button>
    </div>
  );
};

const ProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    category: '',
    image_url: '',
    badge: '',
    sizes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/68a49b74-7604-4ba7-88e4-b850c9f8620e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          old_price: formData.old_price ? parseFloat(formData.old_price) : null,
          category: formData.category,
          image_url: formData.image_url,
          badge: formData.badge || null,
          sizes: formData.sizes
        })
      });
      
      if (response.ok) {
        alert('Товар успешно добавлен!');
        onSuccess();
      } else {
        alert('Ошибка при добавлении товара');
      }
    } catch (err) {
      alert('Ошибка: ' + (err as Error).message);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Название товара</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Описание</Label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Цена</Label>
          <Input 
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Старая цена</Label>
          <Input 
            type="number"
            value={formData.old_price}
            onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Категория</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Платья">Платья</SelectItem>
            <SelectItem value="Блузы">Блузы</SelectItem>
            <SelectItem value="Брюки">Брюки</SelectItem>
            <SelectItem value="Туники">Туники</SelectItem>
            <SelectItem value="Костюмы">Костюмы</SelectItem>
            <SelectItem value="Кардиганы">Кардиганы</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>URL изображения</Label>
        <Input 
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>
      <div>
        <Label>Размеры (например: 48-62)</Label>
        <Input 
          value={formData.sizes}
          onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
        />
      </div>
      <div>
        <Label>Бейдж (ХИТ, NEW, SALE)</Label>
        <Input 
          value={formData.badge}
          onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
        />
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-secondary"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Добавление...
          </>
        ) : (
          'Добавить товар'
        )}
      </Button>
    </form>
  );
};

export default Admin;