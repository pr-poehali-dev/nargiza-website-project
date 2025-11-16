import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/915b3177-6247-4286-bd88-972b6325759a?channelHandle=@nargizamuz&maxResults=3');
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
    const fetchVisitorCount = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/28a09f06-a682-4cb9-9b9c-eeb56ab4c2cd');
        const data = await response.json();
        setVisitorCount(data.visitors);
      } catch (error) {
        console.error('Error fetching visitor count:', error);
      }
    };
    fetchVisitorCount();
  }, []);

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

  const featuredAlbums = [
    {
      title: 'Никчёмная жизнь',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/f8cf36c7-61da-4d88-a041-6b50d15f1795.jpg',
      link: '/albums'
    },
    {
      title: 'Calla Vivid',
      year: 2023,
      cover: 'https://cdn.poehali.dev/files/13c938ba-9097-4030-8363-e259d96ee6f7.jpg',
      link: '/albums'
    }
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
              {['home', 'videos', 'albums', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'videos' && 'Клипы'}
                  {section === 'albums' && 'Альбомы'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
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
              {['home', 'videos', 'albums', 'gallery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'videos' && 'Клипы'}
                  {section === 'albums' && 'Альбомы'}
                  {section === 'gallery' && 'Галерея'}
                </button>
              ))}
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
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://cdn.poehali.dev/files/05bfe7e6-f1fa-4ae6-833a-39cca4ceb2e2.jpg)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background"></div>
        <div className="relative z-10 text-center px-6">
          <h2 className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
            NARGIZA
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light tracking-wide animate-fade-in">
            Российская певица и композитор
          </p>
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

      <section id="videos" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">Клипы</h3>
              <p className="text-xl text-muted-foreground">Последние видео с YouTube</p>
            </div>
            <Button variant="outline" size="lg" onClick={() => navigate('/videos')} className="gap-2 hover:scale-105 transition-transform">
              Все клипы
              <Icon name="ArrowRight" size={20} />
            </Button>
          </div>
          
          {isLoadingVideos ? (
            <div className="text-center text-muted-foreground py-24 animate-pulse">
              <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
              Загрузка видео...
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {videos.map((video, index) => (
                <Card 
                  key={video.videoId} 
                  className="group overflow-hidden animate-scale-in hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <Icon name="Play" size={64} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                        <Icon name="ExternalLink" size={16} />
                        Смотреть на YouTube
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="albums" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h3 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">Альбомы</h3>
              <p className="text-xl text-muted-foreground">Дискография</p>
            </div>
            <Button variant="outline" size="lg" onClick={() => navigate('/albums')} className="gap-2 hover:scale-105 transition-transform">
              Все альбомы
              <Icon name="ArrowRight" size={20} />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {featuredAlbums.map((album, index) => (
              <Card 
                key={index}
                className="group overflow-hidden animate-scale-in cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-secondary/50"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(album.link)}
              >
                <div className="relative h-96 overflow-hidden">
                  <img 
                    src={album.cover} 
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h4 className="text-4xl font-black text-white mb-2 group-hover:text-secondary transition-colors">{album.title}</h4>
                    <p className="text-white/80 text-lg">{album.year}</p>
                  </div>
                </div>
              </Card>
            ))}
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

      <section className="py-16 px-6 border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h4 className="text-3xl font-bold mb-2">NARGIZA</h4>
              <p className="text-muted-foreground">Российская певица и композитор</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" asChild>
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={20} />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://www.instagram.com/nargizamuz?igsh=MThzaDNsYmF0cHdqdg==" target="_blank" rel="noopener noreferrer">
                  <Icon name="Instagram" size={20} />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://youtube.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                  <Icon name="Youtube" size={20} />
                </a>
              </Button>
            </div>
            {visitorCount !== null && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Users" size={20} />
                <span>Посетителей: {visitorCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
