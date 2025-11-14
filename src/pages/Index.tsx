import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const tracks = [
    { title: 'Твоя весна', duration: '3:45', year: '2024' },
    { title: 'Между строк', duration: '4:12', year: '2024' },
    { title: 'Сияние', duration: '3:28', year: '2023' },
    { title: 'Полет', duration: '4:01', year: '2023' },
  ];

  const videos = [
    { title: 'Твоя весна (Official Video)', views: '2.5M', thumbnail: 'https://cdn.poehali.dev/projects/a9e35507-579e-4dde-8893-13e0af328e24/files/82a4c1c0-2f62-4c86-9fff-f1bc3b6f4651.jpg' },
    { title: 'Между строк (Live)', views: '1.8M', thumbnail: 'https://cdn.poehali.dev/projects/a9e35507-579e-4dde-8893-13e0af328e24/files/8430c5ae-89a7-42e6-bbea-7fc55d57fb1b.jpg' },
  ];

  const gallery = [
    'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
    'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
    'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg',
    'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg',
    'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg',
    'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg',
    'https://cdn.poehali.dev/projects/a9e35507-579e-4dde-8893-13e0af328e24/files/23b57e0b-df27-4e5d-aa06-c6a47f008196.jpg',
    'https://cdn.poehali.dev/projects/a9e35507-579e-4dde-8893-13e0af328e24/files/82a4c1c0-2f62-4c86-9fff-f1bc3b6f4651.jpg',
  ];

  const news = [
    { date: '15 ноября 2024', title: 'Новый сингл "Твоя весна"', description: 'Представляю вам мой новый сингл! Доступен на всех платформах.' },
    { date: '2 ноября 2024', title: 'Концертный тур', description: 'Объявляю даты концертного тура по России. Билеты уже в продаже!' },
    { date: '20 октября 2024', title: 'Награда "Прорыв года"', description: 'Получила награду "Прорыв года" на музыкальной премии.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">NARGIZA</h1>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground"
              aria-label="Toggle menu"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>

            <div className="hidden md:flex gap-8">
              {['home', 'music', 'videos', 'gallery', 'news'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'music' && 'Музыка'}
                  {section === 'videos' && 'Видео'}
                  {section === 'gallery' && 'Галерея'}
                  {section === 'news' && 'Новости'}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon">
                <Icon name="Instagram" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Youtube" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Music" size={20} />
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border animate-fade-in">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {['home', 'music', 'videos', 'gallery', 'news'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'music' && 'Музыка'}
                  {section === 'videos' && 'Видео'}
                  {section === 'gallery' && 'Галерея'}
                  {section === 'news' && 'Новости'}
                </button>
              ))}
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button variant="ghost" size="icon">
                  <Icon name="Instagram" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Youtube" size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="Music" size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(26, 31, 44, 0.3), rgba(26, 31, 44, 0.6)), url('https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg')` 
          }}
        />
        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-2xl">
            NARGIZA
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8 font-light drop-shadow-lg">
            Автор и исполнитель
          </p>
          <Button size="lg" className="group" onClick={() => scrollToSection('music')}>
            Слушать музыку
            <Icon name="Play" size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      <section id="music" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-5xl font-bold mb-12 animate-slide-up">Музыка</h3>
          <div className="grid gap-4">
            {tracks.map((track, index) => (
              <Card key={index} className="group hover:bg-card/80 transition-all duration-300 cursor-pointer animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                    <Button size="icon" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon name="Play" size={24} />
                    </Button>
                    <div>
                      <h4 className="font-semibold text-lg">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.year}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground">{track.duration}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Music" size={20} />
              Apple Music
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Circle" size={20} />
              Spotify
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Youtube" size={20} />
              YouTube Music
            </Button>
          </div>
        </div>
      </section>

      <section id="videos" className="py-24 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-5xl font-bold mb-12 animate-slide-up">Видео</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((video, index) => (
              <Card key={index} className="group overflow-hidden cursor-pointer animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="h-16 w-16 rounded-full">
                      <Icon name="Play" size={32} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{video.title}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="Eye" size={16} />
                    {video.views} просмотров
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-5xl font-bold mb-12 animate-slide-up">Галерея</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {gallery.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="news" className="py-24 px-6 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-5xl font-bold mb-12 animate-slide-up">Новости</h3>
          <div className="space-y-8">
            {news.map((item, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-8">
                  <p className="text-sm text-primary mb-3">{item.date}</p>
                  <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-muted-foreground">© 2024 NARGIZA. Все права защищены.</p>
            <div className="flex gap-6">
              <Button variant="ghost" size="icon">
                <Icon name="Instagram" size={24} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Youtube" size={24} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Music" size={24} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Twitter" size={24} />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;