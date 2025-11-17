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

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
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
  const [tracks, setTracks] = useState<Track[]>([]);
  const [visitorStats, setVisitorStats] = useState({ total: 0, last24h: 0 });
  const [animatedStats, setAnimatedStats] = useState({ total: 0, last24h: 0 });
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [nextUpdate, setNextUpdate] = useState<number>(60);

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
    const fetchTracks = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/3b9d2cc1-ed66-4169-bad3-770a54d857b1?artistId=9639626&maxResults=6');
        const data = await response.json();
        console.log('Tracks loaded:', data.tracks);
        setTracks(data.tracks || []);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setIsLoadingTracks(false);
      }
    };
    
    fetchTracks();
    
    const interval = setInterval(() => {
      fetchTracks();
      setNextUpdate(60);
    }, 60 * 60 * 1000);
    
    const countdown = setInterval(() => {
      setNextUpdate(prev => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 60 * 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
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
              <button
                onClick={() => scrollToSection('home')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === 'home' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                {t('nav.gallery')}
              </button>
              <button
                onClick={() => navigate('/albums')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                {t('nav.albums')}
              </button>
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
              <button
                onClick={() => scrollToSection('home')}
                className={`text-left text-lg font-medium transition-colors hover:text-primary py-2 ${
                  activeSection === 'home' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
              >
                {t('nav.gallery')}
              </button>
              <button
                onClick={() => navigate('/albums')}
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
              >
                {t('nav.albums')}
              </button>
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

      <section id="home" className="relative h-screen flex items-end justify-center overflow-hidden pb-32">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://disk.yandex.ru/i/RHi8UTfTCTu60A" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent drop-shadow-2xl tracking-tighter animate-fade-in">
            NARGIZA
          </h2>
          <p className="text-2xl md:text-3xl text-white font-light drop-shadow-2xl tracking-wide">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-b from-background via-card/50 to-background">
        <div className="container mx-auto max-w-5xl">
          <div className="animate-fade-in">
            <h3 className="text-5xl md:text-6xl font-black mb-16 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('about.title')}</h3>
            
            <div className="space-y-8 text-center max-w-3xl mx-auto">
              <p className="text-xl text-foreground/90 leading-relaxed font-light">
                {t('about.p1')}
              </p>
              <p className="text-xl text-foreground/90 leading-relaxed font-light">
                {t('about.p2')}
              </p>
              <p className="text-xl text-foreground/90 leading-relaxed font-light">
                {t('about.p3')}
              </p>
              <p className="text-xl text-foreground/90 leading-relaxed font-light">
                {t('about.p4')}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-16 justify-center">
              <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-transform" asChild>
                <a href="https://music.yandex.ru/artist/9639626?utm_source=web&utm_medium=copy_link" target="_blank" rel="noopener noreferrer">
                  <Icon name="Music" size={20} />
                  Яндекс Музыка
                </a>
              </Button>
              <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-transform" asChild>
                <a href="https://music.apple.com/tr/artist/nargiza/1720377821" target="_blank" rel="noopener noreferrer">
                  <Icon name="Music" size={20} />
                  Apple Music
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-pulse"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <a 
            href="https://t.me/+S_nWXyBTkcI0MzQy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-primary p-1 hover:scale-[1.02] transition-all duration-300 shadow-2xl hover:shadow-primary/50">
              <div className="bg-background rounded-[22px] p-12 md:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 group-hover:from-primary/10 group-hover:via-secondary/10 group-hover:to-primary/10 transition-all"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon name="Send" size={36} className="text-white" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Присоединяйся к каналу
                  </h3>
                  <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Эксклюзивный контент, новости и общение с фанатами
                  </p>
                  <div className="inline-flex items-center gap-3 text-lg font-semibold text-primary group-hover:gap-5 transition-all">
                    <span>Открыть Telegram</span>
                    <Icon name="ArrowRight" size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('tracks.title')}
            </h3>
            <p className="text-lg text-muted-foreground">{t('tracks.subtitle')}</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Icon name="Clock" size={16} className="text-primary" />
              <span>Обновление через {nextUpdate} мин</span>
            </div>
          </div>
          
          {isLoadingTracks ? (
            <div className="text-center text-muted-foreground py-12 animate-pulse">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
              Загрузка треков...
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="block group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] border-l-4 border-l-primary/50 hover:border-l-primary">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        <Icon name="Music" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Icon name="Mic2" size={14} className="flex-shrink-0" />
                          {track.artist}
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Play" size={20} className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2"
              asChild
            >
              <a href="https://music.yandex.ru/artist/9639626" target="_blank" rel="noopener noreferrer">
                <Icon name="Music" size={20} />
                {t('tracks.listen')}
              </a>
            </Button>
          </div>
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