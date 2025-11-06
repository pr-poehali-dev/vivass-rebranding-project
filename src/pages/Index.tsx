import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Платье "Элегант"',
      price: 4990,
      oldPrice: 6990,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      badge: 'ХИТ',
      category: 'Платья',
      sizes: '50-62'
    },
    {
      id: 2,
      name: 'Блуза "Романтика"',
      price: 2990,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      badge: 'NEW',
      category: 'Блузы',
      sizes: '50-60'
    },
    {
      id: 3,
      name: 'Брюки "Комфорт"',
      price: 3490,
      oldPrice: 4990,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      badge: 'SALE',
      category: 'Брюки',
      sizes: '48-64'
    },
    {
      id: 4,
      name: 'Туника "Весна"',
      price: 2790,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      category: 'Туники',
      sizes: '52-62'
    },
    {
      id: 5,
      name: 'Костюм "Деловой"',
      price: 6990,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      badge: 'NEW',
      category: 'Костюмы',
      sizes: '50-64'
    },
    {
      id: 6,
      name: 'Кардиган "Уют"',
      price: 3990,
      oldPrice: 5490,
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/98178635-e8d9-4957-b063-5cdc53076a38.jpg',
      badge: 'SALE',
      category: 'Кардиганы',
      sizes: '48-62'
    }
  ];

  const promos = [
    {
      id: 1,
      title: 'Скидки до 40%',
      description: 'На новую коллекцию осень-зима',
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/3f1fa172-9dbb-48ec-980a-caa1ac304209.jpg'
    },
    {
      id: 2,
      title: 'Бесплатная доставка',
      description: 'При заказе от 3000 ₽',
      image: 'https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/3f1fa172-9dbb-48ec-980a-caa1ac304209.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              VIVASS
            </span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            {['home', 'catalog', 'delivery', 'promos', 'contacts'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-sm font-medium transition-all hover:text-primary ${
                  activeSection === section ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {section === 'home' && 'Главная'}
                {section === 'catalog' && 'Каталог'}
                {section === 'delivery' && 'Доставка'}
                {section === 'promos' && 'Акции'}
                {section === 'contacts' && 'Контакты'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hidden sm:flex">
              <Icon name="Search" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Icon name="ShoppingCart" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hidden sm:flex">
              <Icon name="User" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t animate-fade-in">
            <nav className="container py-4 flex flex-col gap-3">
              {['home', 'catalog', 'delivery', 'promos', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-4 rounded-lg font-medium transition-all ${
                    activeSection === section 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'catalog' && 'Каталог'}
                  {section === 'delivery' && 'Доставка'}
                  {section === 'promos' && 'Акции'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {activeSection === 'home' && (
        <>
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-fade-in" />
            <div className="container relative z-10">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div className="space-y-6 animate-slide-up">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 px-4 py-1">
                    Новая коллекция
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
                    Стиль без
                    <br />
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      ограничений
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                    Модная женская одежда больших размеров 48-64. Будьте красивой в любом размере!
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white border-0 px-8"
                      onClick={() => setActiveSection('catalog')}
                    >
                      В каталог
                      <Icon name="ArrowRight" size={20} className="ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-2 hover:border-primary">
                      Узнать больше
                    </Button>
                  </div>
                </div>
                <div className="relative animate-scale-in">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-3xl rounded-full" />
                  <img 
                    src="https://cdn.poehali.dev/projects/580efbcf-2b7f-4be2-ab87-39c8b241c412/files/a496c178-228c-4092-a7ea-ff05c89461fd.jpg"
                    alt="Hero"
                    className="relative rounded-3xl shadow-2xl w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                  { icon: 'Truck', title: 'Быстрая доставка', desc: 'От 1 дня' },
                  { icon: 'Sparkles', title: 'Качество', desc: 'Премиум ткани' },
                  { icon: 'Ruler', title: 'Размеры', desc: '48-64' },
                  { icon: 'Heart', title: 'Поддержка', desc: 'Консультации' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-background transition-all duration-300 group">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name={item.icon as any} size={32} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'catalog' && (
        <section className="py-16">
          <div className="container">
            <div className="mb-12 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Каталог товаров</h2>
              <p className="text-xl text-muted-foreground">Выбирайте из нашего ассортимента</p>
            </div>

            <div className="mb-8 flex flex-wrap gap-2 md:gap-3">
              {['Все', 'Платья', 'Блузы', 'Брюки', 'Туники', 'Костюмы', 'Кардиганы'].map((cat) => (
                <Button key={cat} variant="outline" className="hover:border-primary hover:text-primary">
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, idx) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="p-0 relative">
                    {product.badge && (
                      <Badge className={`absolute top-4 right-4 z-10 ${
                        product.badge === 'SALE' ? 'bg-accent' : 
                        product.badge === 'NEW' ? 'bg-secondary' : 
                        'bg-primary'
                      } text-white border-0`}>
                        {product.badge}
                      </Badge>
                    )}
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                    <div className="text-xs md:text-sm text-muted-foreground">{product.category} • Размеры {product.sizes}</div>
                    <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl font-bold">{product.price.toLocaleString()} ₽</span>
                      {product.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.oldPrice.toLocaleString()} ₽
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0 flex gap-2 md:gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-sm md:text-base">
                      <Icon name="ShoppingCart" size={16} className="mr-1 md:mr-2" />
                      <span className="hidden sm:inline">В корзину</span>
                      <span className="sm:hidden">Купить</span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary">
                      <Icon name="Heart" size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'delivery' && (
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="mb-12 text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Доставка и оплата</h2>
              <p className="text-xl text-muted-foreground">Удобные способы получения заказа</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Icon name="Truck" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Курьерская доставка</CardTitle>
                  <CardDescription>По Москве и МО</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Доставка в день заказа</p>
                  <p className="text-sm">• Стоимость: от 300 ₽</p>
                  <p className="text-sm">• Бесплатно от 5000 ₽</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Icon name="Store" size={24} className="text-secondary" />
                  </div>
                  <CardTitle>Пункты выдачи</CardTitle>
                  <CardDescription>По всей России</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Более 1000 пунктов</p>
                  <p className="text-sm">• Доставка 2-5 дней</p>
                  <p className="text-sm">• От 200 ₽</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-12" />

            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold">Способы оплаты</h3>
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                {[
                  { icon: 'CreditCard', title: 'Банковской картой', desc: 'Visa, MasterCard, МИР' },
                  { icon: 'Wallet', title: 'Электронные деньги', desc: 'ЮMoney, QIWI' },
                  { icon: 'Smartphone', title: 'СБП', desc: 'Система быстрых платежей' }
                ].map((method) => (
                  <Card key={method.title} className="border hover:border-primary/50 transition-all">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                        <Icon name={method.icon as any} size={24} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">{method.title}</p>
                        <p className="text-sm text-muted-foreground">{method.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'promos' && (
        <section className="py-16">
          <div className="container">
            <div className="mb-12 text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Акции и спецпредложения</h2>
              <p className="text-xl text-muted-foreground">Выгодные предложения для вас</p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mb-8 md:mb-12">
              {promos.map((promo) => (
                <Card key={promo.id} className="overflow-hidden border-2 hover:border-primary transition-all group">
                  <div className="relative h-64">
                    <img 
                      src={promo.image} 
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-3xl font-bold text-white mb-2">{promo.title}</h3>
                      <p className="text-lg text-white/90">{promo.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold">Подпишитесь на рассылку</h3>
                    <p className="text-muted-foreground">Получайте информацию о новых акциях и специальных предложениях</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
                    <Input placeholder="Ваш email" className="md:w-64" />
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
                      Подписаться
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {activeSection === 'contacts' && (
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="mb-12 text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Контакты</h2>
              <p className="text-xl text-muted-foreground">Свяжитесь с нами удобным способом</p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8 md:mb-12">
              {[
                { icon: 'Phone', title: 'Телефон', value: '+7 (495) 123-45-67', link: 'tel:+74951234567' },
                { icon: 'Mail', title: 'Email', value: 'info@vivass.ru', link: 'mailto:info@vivass.ru' },
                { icon: 'MapPin', title: 'Адрес', value: 'Москва, ул. Примерная, 1', link: '#' }
              ].map((contact) => (
                <Card key={contact.title} className="border-2 hover:border-primary transition-all text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon name={contact.icon as any} size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{contact.title}</p>
                      <a href={contact.link} className="text-muted-foreground hover:text-primary transition-colors">
                        {contact.value}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Напишите нам</CardTitle>
                <CardDescription>Мы ответим в течение 24 часов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Имя</label>
                    <Input placeholder="Ваше имя" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Сообщение</label>
                  <textarea 
                    className="w-full min-h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Ваше сообщение..."
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
                  Отправить сообщение
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <footer className="border-t bg-muted/30 py-12 mt-16">
        <div className="container">
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent">
                  <Icon name="Zap" size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  VIVASS
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Модная одежда больших размеров для стильных женщин
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Покупателям</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer transition-colors">Как оформить заказ</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Оплата и доставка</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Возврат товара</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Компания</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="hover:text-primary cursor-pointer transition-colors">О нас</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Вакансии</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Партнерам</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Мы в соцсетях</h4>
              <div className="flex gap-3">
                {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                  <Button key={social} variant="outline" size="icon" className="hover:border-primary hover:text-primary">
                    <Icon name={social as any} size={18} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 VIVASS. Все права защищены</p>
            <div className="flex gap-6">
              <span className="hover:text-primary cursor-pointer transition-colors">Политика конфиденциальности</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Условия использования</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;