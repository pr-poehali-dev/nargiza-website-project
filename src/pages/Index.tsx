import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';


interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [visitorStats, setVisitorStats] = useState({ total: 0, last24h: 0 });
  const [animatedStats, setAnimatedStats] = useState({ total: 0, last24h: 0 });
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/915b3177-6247-4286-bd88-972b6325759a?channelHandle=@nargizamuz&maxResults=12');
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    const trackAndFetchStats = async () => {
      try {
        await fetch('https://functions.poehali.dev/7fd3cff1-99f4-4cfc-a78b-6a518c6f06d8', {
          method: 'POST'
        });
        
        const response = await fetch('https://functions.poehali.dev/7fd3cff1-99f4-4cfc-a78b-6a518c6f06d8');
        const data = await response.json();
        setVisitorStats(data);
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };
    trackAndFetchStats();
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        total: Math.floor(visitorStats.total * progress),
        last24h: Math.floor(visitorStats.last24h * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(visitorStats);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [visitorStats]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };



  const gallery = [
    'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
    'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
    'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg',
    'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg',
    'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg',
    'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg',
    'https://cdn.poehali.dev/files/6e664d2a-d6bb-4e1a-884f-6fe844889d2c.jpg',
    'https://cdn.poehali.dev/files/7cfb1c54-5be8-486f-b126-6039752e5677.jpg',
    'https://cdn.poehali.dev/files/83c64ba9-9359-4f30-a131-6ec03d3e84d2.jpg',
    'https://cdn.poehali.dev/files/1d071cd8-6992-4a04-8cd0-91e1c505b8e1.jpg',
  ];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, gallery.length]);



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
              {['home', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
              <button
                onClick={() => navigate('/videos')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Клипы
              </button>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                  <Icon name="Instagram" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                  <Icon name="Youtube" size={20} />
                </a>
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
              {['home', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
              <button
                onClick={() => navigate('/videos')}
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
              >
                Клипы
              </button>
              <div className="flex gap-4 pt-4 border-t border-border">
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                    <Icon name="Send" size={20} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                    <Icon name="Instagram" size={20} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                    <Icon name="Youtube" size={20} />
                  </a>
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
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: 'url(https://cdn.poehali.dev/files/05bfe7e6-f1fa-4ae6-833a-39cca4ceb2e2.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h2 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
            NARGIZA
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light tracking-wide animate-fade-in">
            Российская певица и композитор
          </p>
          
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-12 animate-scale-in">
            <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-primary mb-2">{animatedStats.total.toLocaleString()}</div>
              <div className="text-sm text-white/70">Всего посещений</div>
            </div>
            <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-secondary mb-2">{animatedStats.last24h.toLocaleString()}</div>
              <div className="text-sm text-white/70">За последний день</div>
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <Button variant="default" size="lg" className="gap-2 text-lg px-8 py-6 shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all" asChild>
              <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                <Icon name="Youtube" size={24} />
                YouTube
              </a>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 border-white/20 hover:bg-white/10 text-white shadow-2xl" asChild>
              <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                <Icon name="Send" size={24} />
                Telegram
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-background/40 backdrop-blur-md border-white/10 overflow-hidden shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="Youtube" size={32} className="text-primary" />
                  <h4 className="text-2xl font-bold text-white">Последние клипы</h4>
                </div>
                {isLoadingVideos ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-white/5">
                    {videos.slice(0, 3).map((video) => (
                      <div
                        key={video.videoId}
                        className="flex gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="default" 
                  className="w-full mt-6 gap-2"
                  onClick={() => navigate('/videos')}
                >
                  <Icon name="PlayCircle" size={18} />
                  Все клипы
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-md border-white/10 overflow-hidden shadow-2xl hover:shadow-secondary/30 transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Icon name="Music" size={32} className="text-secondary" />
                  <h4 className="text-2xl font-bold text-white">Дискография</h4>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-lg font-semibold mb-3 text-primary">Альбомы</h5>
                    <div className="space-y-2">
                      <details className="group">
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-center gap-3 mb-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                            <Icon name="Disc3" size={20} className="text-secondary" />
                            <span className="flex-1 text-white font-medium">«Симметрия» (2019)</span>
                            <Icon name="ChevronDown" size={16} className="text-muted-foreground group-open:rotate-180 transition-transform" />
                          </div>
                        </summary>
                        <div className="pl-9 pr-3 pb-3 space-y-1 text-sm text-muted-foreground">
                          {['Симметрия', 'Миша', 'Красивые уходят рано', 'Лабиринт', 'Ты же выжил, солдат', 'Ох, мама не женюсь', 'Солнечные дни', 'Ни любви, ни дружбы', 'Фальшивое вино', 'Он тебя целует', 'Твой муж и мой муж', 'Виноград'].map((track, i) => (
                            <div key={i} className="flex items-center gap-2 py-1">
                              <Icon name="Music" size={12} className="text-secondary" />
                              <span>{track}</span>
                            </div>
                          ))}
                          <div className="pt-3 mt-3 border-t border-white/10">
                            <Button variant="ghost" size="sm" className="w-full gap-2" asChild>
                              <a href="https://music.yandex.ru/album/7360286?lang=ru" target="_blank" rel="noopener noreferrer">
                                <Icon name="Headphones" size={16} />
                                Слушать альбом
                              </a>
                            </Button>
                          </div>
                        </div>
                      </details>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Disc3" size={20} className="text-secondary" />
                      <span className="text-muted-foreground">«Украина»</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-3 text-primary">Синглы</h5>
                    <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                      {['Я волонтёр', 'Земля', 'Ты мне врёшь', 'Он занят', 'Похоронка', 'Сижу на работе', 'Immortal Regiment', 'Ты изменил мне', 'Мы вернёмся', 'Crimson Dream'].map((single, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Icon name="Music" size={14} className="text-secondary" />
                          <span>{single}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full gap-2"
                    onClick={() => navigate('/albums')}
                  >
                    <Icon name="Disc3" size={18} />
                    Все альбомы
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="gallery" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">Галерея</h3>
            <p className="text-xl text-muted-foreground">Моменты из моей творческой жизни</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer animate-scale-in shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Icon name="ZoomIn" size={48} className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                </div>
              </div>
            ))}
          </div>

          {lightboxOpen && (
            <div 
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
              onClick={closeLightbox}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-50 bg-black/50 rounded-full p-2"
                aria-label="Закрыть"
              >
                <Icon name="X" size={32} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-6 text-white hover:text-primary transition-colors z-50"
                aria-label="Предыдущее фото"
              >
                <Icon name="ChevronLeft" size={48} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 text-white hover:text-primary transition-colors z-50"
                aria-label="Следующее фото"
              >
                <Icon name="ChevronRight" size={48} />
              </button>

              <img
                src={gallery[currentImageIndex]}
                alt={`Gallery ${currentImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm z-50">
                {currentImageIndex + 1} / {gallery.length}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;