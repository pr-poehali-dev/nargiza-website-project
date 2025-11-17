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
          <Button size="lg" className="group rounded-full px-8 py-6 text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110" onClick={() => navigate('/gallery')}>
            {t('hero.cta')}
            <Icon name="Image" size={22} className="ml-2 transition-transform group-hover:translate-x-2" />
          </Button>
        </div>
      </section>

      <section className="py-24 px-6 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-fade-in text-center">
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
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
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
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Я волонтёр', cover: 'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg', date: '28.03.2025' },
              { title: 'Земля', cover: 'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg', date: '01.03.2025' },
              { title: 'Ты мне врёшь', cover: 'https://cdn.poehali.dev/files/61a5e76d-d6aa-4bb7-ba7f-c43a25aefb6e.jpg', date: '14.02.2025' },
              { title: 'Он занят', cover: 'https://cdn.poehali.dev/files/469f299e-8ac3-4a30-850e-e1c3c53a9f06.jpg', date: '31.01.2025' },
              { title: 'Похоронка', cover: 'https://cdn.poehali.dev/files/44a7af92-053e-4bd1-8ae5-e3d87477fa34.jpg', date: '17.01.2025' },
              { title: 'Сижу на работе', cover: 'https://cdn.poehali.dev/files/207cbbc7-08c5-4011-a142-53a39404e9b2.jpg', date: '03.01.2025' },
            ].map((track, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1 truncate">
                      {track.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">NARGIZA</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{track.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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