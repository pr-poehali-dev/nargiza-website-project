import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';


interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    document.title = t('meta.home.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta.home.description'));
    }
    document.documentElement.lang = language;
  }, [language, t]);
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
    'https://cdn.poehali.dev/files/22a7ecef-acd1-4df1-9da2-6b6e8a1014ad.png',
    'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
    'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
    'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg',
    'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg',
    'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg',
    'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg',
    'https://cdn.poehali.dev/files/6e664d2a-d6bb-4e1a-884f-6fe844889d2c.jpg',
    'https://cdn.poehali.dev/files/7cfb1c54-5be8-486f-b126-6039752e5677.jpg',
    'https://cdn.poehali.dev/files/83c64ba9-9359-4f30-a131-6ec03d3e84d2.jpg',
    'https://cdn.poehali.dev/files/f92e5b4b-bb63-4662-b6cd-5e2a74252fd4.jpg',
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
                  {t(`nav.${section}`)}
                </button>
              ))}
              <button
                onClick={() => navigate('/videos')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                {t('nav.videos')}
              </button>
            </div>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="text-xs font-medium gap-2"
              >
                <span className="text-base">{language === 'ru' ? '🇬🇧' : '🇷🇺'}</span>
                {language === 'ru' ? 'EN' : 'RU'}
              </Button>
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
                  {t(`nav.${section}`)}
                </button>
              ))}
              <button
                onClick={() => navigate('/videos')}
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
              >
                {t('nav.videos')}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="text-xs font-medium w-fit mt-2 gap-2"
              >
                <span className="text-base">{language === 'ru' ? '🇬🇧' : '🇷🇺'}</span>
                {language === 'ru' ? 'EN' : 'RU'}
              </Button>
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
        <img
          src="https://cdn.poehali.dev/files/13c938ba-9097-4030-8363-e259d96ee6f7.jpg"
          alt="NARGIZA"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent drop-shadow-2xl tracking-tighter animate-fade-in">
            NARGIZA
          </h2>
          <p className="text-2xl md:text-3xl text-white mb-12 font-light drop-shadow-2xl tracking-wide">
            {t('hero.subtitle')}
          </p>
          <Button size="lg" className="group rounded-full px-8 py-6 text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110" onClick={() => scrollToSection('gallery')}>
            {t('hero.cta')}
            <Icon name="Image" size={22} className="ml-2 transition-transform group-hover:translate-x-2" />
          </Button>
        </div>
      </section>

      <section className="py-24 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h3 className="text-5xl font-bold mb-8">{t('about.title')}</h3>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('about.p1')}
              </p>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('about.p2')}
              </p>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('about.p3')}
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t('about.p4')}
              </p>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <a href="https://music.yandex.ru/artist/9639626?utm_source=web&utm_medium=copy_link" target="_blank" rel="noopener noreferrer">
                    <Icon name="Music" size={20} />
                    Яндекс Музыка
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="gap-2" asChild>
                  <a href="https://music.apple.com/tr/artist/nargiza/1720377821" target="_blank" rel="noopener noreferrer">
                    <Icon name="Music" size={20} />
                    Apple Music
                  </a>
                </Button>
              </div>
            </div>

            <div className="animate-scale-in">
              <Card>
                <CardContent className="p-8">
                  <h4 className="text-2xl font-bold mb-6">{t('discography.title')}</h4>
                  
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold mb-3 text-primary">{t('discography.albums')}</h5>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Disc3" size={20} className="text-secondary" />
                      <details className="cursor-pointer group">
                        <summary className="list-none text-muted-foreground hover:text-foreground transition-colors">
                          «{t('album.worthless')}»
                          <Icon name="ChevronDown" size={16} className="inline ml-1 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="pl-8 mt-3 space-y-2 text-sm">
                          {[
                            'Когда ты один',
                            'Пустой экран',
                            'Никто не ждёт (Сл. A.Nevskiy)',
                            'Никчёмная жизнь',
                            'Когда никто не ищет',
                            'Всё проходит (Сл. Ю.Левитанский)',
                            'Мы тратим время',
                            'Забудешь',
                            'Мне нечем заняться',
                            'Одно и то же',
                            'Вся суть',
                            'Молодо зелено',
                            'Земной путь',
                            'Смартфон',
                            'Это другая я'
                          ].map((track, i) => (
                            <div key={i} className="text-muted-foreground/80">
                              {i + 1}. {track}
                            </div>
                          ))}
                          <div className="flex gap-2 pt-3">
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://music.yandex.ru/album/38836368" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Яндекс
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://music.apple.com/tr/album/%D0%BD%D0%B8%D0%BA%D1%87%D1%91%D0%BC%D0%BD%D0%B0%D1%8F-%D0%B6%D0%B8%D0%B7%D0%BD%D1%8C/1848552571" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Apple
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                              <a href="https://open.spotify.com/album/2LhOw0UIUtiSxa5DVOpJ7e" target="_blank" rel="noopener noreferrer">
                                <Icon name="Music" size={14} />
                                Spotify
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
                    <h5 className="text-lg font-semibold mb-3 text-primary">{t('discography.singles')}</h5>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('tracks.title')}
            </h3>
            <p className="text-lg text-muted-foreground">{t('tracks.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingVideos ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="h-5 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              videos.slice(0, 6).map((video) => (
                <Card key={video.videoId} className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="Play" size={48} className="text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full gap-2 mt-2"
                      asChild
                    >
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon name="Youtube" size={18} />
                        {t('videos.watch')}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!isLoadingVideos && videos.length > 6 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => navigate('/videos')}
              >
                <Icon name="Youtube" size={20} />
                {t('nav.videos')}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section id="gallery" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">{t('gallery.title')}</h3>
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
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-10"
                aria-label="Закрыть"
              >
                <Icon name="X" size={32} />
              </button>
              
              <button
                onClick={prevImage}
                className="absolute left-6 text-white hover:text-primary transition-colors z-10"
                aria-label="Предыдущее фото"
              >
                <Icon name="ChevronLeft" size={48} />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-6 text-white hover:text-primary transition-colors z-10"
                aria-label="Следующее фото"
              >
                <Icon name="ChevronRight" size={48} />
              </button>

              <img
                src={gallery[currentImageIndex]}
                alt={`Gallery ${currentImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
              
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentImageIndex + 1} / {gallery.length}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="py-16 px-6 border-t border-border/50 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col gap-3 text-center md:text-left">
                <h4 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">NARGIZA</h4>
                <p className="text-muted-foreground font-medium">{t('footer.copyright')}</p>
                <a href="mailto:bodma@mail.ru" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 justify-center md:justify-start">
                  <Icon name="Mail" size={18} />
                  bodma@mail.ru
                </a>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-all hover:bg-primary/10" asChild>
                  <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                    <Icon name="Send" size={24} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-all hover:bg-primary/10" asChild>
                  <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                    <Icon name="Instagram" size={24} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-all hover:bg-primary/10" asChild>
                  <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                    <Icon name="Youtube" size={24} />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="hover:scale-110 transition-all hover:bg-primary/10">
                  <Icon name="Music" size={24} />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={16} className="text-primary" />
                <span>{t('stats.today')}: <strong className="text-foreground tabular-nums transition-all duration-300">{animatedStats.last24h}</strong></span>
              </div>
              <div className="hidden sm:block text-muted-foreground/50">•</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <span>{t('stats.total')}: <strong className="text-foreground tabular-nums transition-all duration-300">{animatedStats.total}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;