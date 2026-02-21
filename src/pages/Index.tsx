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

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  urlToImage?: string;
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

  const [streamUrlCopied, setStreamUrlCopied] = useState(false);
  const [forumMessages, setForumMessages] = useState<{id: number; author_name: string; content: string; created_at: string; topic_id: number; topic_title: string}[]>([]);

  const [telegramSubscribers, setTelegramSubscribers] = useState<number | null>(null);

  useEffect(() => {
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
      });

    const initWidget = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.jQuery && w.StatusWidget) {
        w.jQuery(document).ready(function() {
          new w.StatusWidget(
            {djImage:false,djName:false,listenersNum:true,trackCurrent:true,history:false,widgetWidth:350},
            1, "http://130.49.148.73:1030", "#RTWidgetStatus", "ru"
          );
        });
      }
    };

    loadScript('https://code.jquery.com/jquery-2.2.4.min.js')
      .then(() => loadScript('https://yandex.st/jquery/tmpl/1.0.0pre/jquery.tmpl.min.js'))
      .then(() => loadScript('http://130.49.148.73:1030/media/static/js/external/status-widget.js'))
      .then(initWidget)
      .catch(console.error);
  }, []);



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
        console.log('Tracks loaded:', data);
        
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setTracks([
          {
            id: '145171227',
            title: 'Новый трек 1',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12345/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171227'
          },
          {
            id: '145171239',
            title: 'Новый трек 2',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12346/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171239'
          },
          {
            id: '145171238',
            title: 'Новый трек 3',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12347/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171238'
          },
          {
            id: '145171233',
            title: 'Новый трек 4',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12348/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171233'
          },
          {
            id: '145171235',
            title: 'Новый трек 5',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12349/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171235'
          },
          {
            id: '145171232',
            title: 'Новый трек 6',
            artist: 'NARGIZA',
            cover: 'https://avatars.yandex.net/get-music-content/12350/cover.400x400.jpg',
            url: 'https://music.yandex.ru/album/145171/track/145171232'
          }
        ]);
      } finally {
        setIsLoadingTracks(false);
      }
    };
    
    fetchTracks();
    
    const interval = setInterval(() => {
      fetchTracks();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
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
    const fetchForumLatest = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/58ac260a-a36e-4d53-9858-d0c993339a0e?action=latest&limit=5');
        const data = await response.json();
        setForumMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching forum messages:', error);
      }
    };
    fetchForumLatest();
  }, []);

  useEffect(() => {
    const fetchTelegramStats = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/552e2e24-011c-4cad-9e44-60eccfbc41b7?chatId=-1002321956226');
        const data = await response.json();
        console.log('Telegram stats response:', data);
        if (data.subscribers && data.subscribers > 0) {
          setTelegramSubscribers(data.subscribers);
        }
      } catch (error) {
        console.error('Error fetching Telegram stats:', error);
      }
    };

    fetchTelegramStats();
    const interval = setInterval(() => {
      fetchTelegramStats();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
              <button
                onClick={() => navigate('/forum')}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Форум
              </button>
              <a
                href="http://130.49.148.73:1030/api/startpage/1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground flex items-center gap-1"
              >
                <Icon name="Radio" size={14} />
                Радио
              </a>
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
                <a href="https://max.ru/join/btkovK_LOSzZKNOdqyqwtZQVlqwxcQX56V63RCHNNSE" target="_blank" rel="noopener noreferrer">
                  <Icon name="MessageCircle" size={20} />
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
              <Button variant="ghost" size="icon" asChild>
                <a href="https://tiktok.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                  <Icon name="Music" size={20} />
                </a>
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
              <button
                onClick={() => navigate('/forum')}
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground"
              >
                Форум
              </button>
              <a
                href="http://130.49.148.73:1030/api/startpage/1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left text-lg font-medium transition-colors hover:text-primary py-2 text-muted-foreground flex items-center gap-2"
              >
                <Icon name="Radio" size={18} />
                Радио
              </a>
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
                  <a href="https://max.ru/join/H4mTmMsolpd8rW3VWN9f0BN_L_ifpKzkTe2ybXRPALk" target="_blank" rel="noopener noreferrer">
                    <Icon name="MessageCircle" size={20} />
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
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://tiktok.com/@nargizamuz" target="_blank" rel="noopener noreferrer">
                    <Icon name="Music" size={20} />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative h-screen flex items-end justify-center overflow-hidden pb-20">
        <img
          src="https://cdn.poehali.dev/projects/a9e35507-579e-4dde-8893-13e0af328e24/bucket/90310330-b0a3-4212-8ca6-48ae2ed3d1a8.jpg"
          alt="Nargiza background"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          style={{ transform: 'translateZ(0)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent drop-shadow-2xl tracking-tighter animate-fade-in">
            NARGIZA
          </h2>
          <p className="text-2xl md:text-3xl text-white font-light drop-shadow-2xl tracking-wide mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="text-5xl md:text-6xl hover:scale-125 transition-all duration-500 cursor-pointer drop-shadow-2xl animate-bounce-slow" style={{animationDelay: '0s'}} title="Казахстан">🇰🇿</span>
            <span className="text-5xl md:text-6xl hover:scale-125 transition-all duration-500 cursor-pointer drop-shadow-2xl animate-bounce-slow" style={{animationDelay: '0.3s'}} title="Россия">🇷🇺</span>
          </div>
          <div className="mt-10">
            <a
              href="http://130.49.148.73:1030/api/startpage/1/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/20 border border-primary/40 text-white font-semibold text-lg hover:bg-primary/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm drop-shadow-2xl"
            >
              <span className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-red-500 opacity-50"></span>
                <Icon name="Radio" size={22} className="relative" />
              </span>
              Слушать радио • NARGIZA
            </a>
          </div>
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
              <Button variant="outline" size="lg" className="gap-2 hover:scale-105 transition-transform" asChild>
                <a href="https://open.spotify.com/artist/7anXMqM1b8Sf3ML56oMCrb?si=2imEDzF2TpGXOVVp_N6zAA" target="_blank" rel="noopener noreferrer">
                  <Icon name="Music" size={20} />
                  Spotify
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">В эфире</span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Радио NARGIZA
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Слушайте любимые треки в прямом эфире — 24 часа в сутки, 7 дней в неделю
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div id="RTWidgetStatus"></div>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10 flex items-center gap-3">
                  <Icon name="Megaphone" size={20} className="text-primary" />
                  <h4 className="text-lg font-bold">Объявление</h4>
                </div>
                <div className="p-6 md:p-8 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Друзья, я уже сообщала что запущено <span className="text-foreground font-semibold">Радио NARGIZA</span>. В данный момент оно работает в тестовом режиме и мы постепенно заполняем его песнями и музыкой.
                  </p>
                  <p>
                    Я хочу сообщить, что мы выпустили <span className="text-foreground font-semibold">собственное приложение для Android</span>, которое можно скачать по ссылке внизу из Google Play. Приложение официальное и очень простое — скачиваете, устанавливаете, запускаете — и всё играет и поёт!
                  </p>
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="Music" size={18} className="text-primary mt-0.5 shrink-0" />
                      <p>В <span className="font-medium text-foreground">тестовом режиме</span> играет только музыка, в <span className="font-medium text-foreground">обычном</span> — только песни.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="ListMusic" size={18} className="text-primary mt-0.5 shrink-0" />
                      <p>Любой пользователь может выбрать в приложении любую песню и <span className="font-medium text-foreground">заказать её в эфир</span> — она зазвучит сразу после окончания звучащей в эфире песни.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Sparkles" size={18} className="text-primary mt-0.5 shrink-0" />
                      <p>Можно публиковать самые свежие песни и музыку в разных вариантах. Мне как исполнителю это очень удобно.</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <Button className="w-full sm:w-auto gap-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-sm px-8 py-6" asChild>
                    <a href="https://play.google.com/store/apps/details?id=center.streaming.radio.nargiza" target="_blank" rel="noopener noreferrer">
                      <Icon name="Smartphone" size={20} />
                      Скачать из Google Play
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10 flex items-center gap-3">
                  <Icon name="Calendar" size={20} className="text-primary" />
                  <h4 className="text-lg font-bold">График работы</h4>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">Пн — Пт</span>
                    </div>
                    <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">Тестовый режим</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">Сб — Вс</span>
                    </div>
                    <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">Хиты на час</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-b border-secondary/10 flex items-center gap-3">
                  <Icon name="Radio" size={20} className="text-secondary" />
                  <h4 className="text-lg font-bold">URL потока</h4>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-3">Для сторонних плееров:</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('http://radionargiza.ru:1040/stream');
                      setStreamUrlCopied(true);
                      setTimeout(() => setStreamUrlCopied(false), 2000);
                    }}
                    className="relative w-full group/copy"
                  >
                    <code className="block w-full px-4 py-3 bg-background rounded-lg text-xs text-primary border border-border font-mono break-all text-left hover:border-primary/50 transition-colors cursor-pointer">
                      http://radionargiza.ru:1040/stream
                    </code>
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium transition-all ${streamUrlCopied ? 'text-green-500' : 'text-muted-foreground opacity-0 group-hover/copy:opacity-100'}`}>
                      <Icon name={streamUrlCopied ? 'Check' : 'Copy'} size={14} />
                      {streamUrlCopied ? 'Скопировано!' : 'Копировать'}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>



      <section className="py-20 px-6 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-pulse"></div>
        <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
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
                  {telegramSubscribers !== null && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Icon name="Users" size={20} className="text-primary" />
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {telegramSubscribers.toLocaleString('ru-RU')}
                      </span>
                      <span className="text-lg text-muted-foreground">подписчиков</span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-3 text-lg font-semibold text-primary group-hover:gap-5 transition-all">
                    <span>Открыть Telegram</span>
                    <Icon name="ArrowRight" size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </a>

          <a 
            href="https://max.ru/join/btkovK_LOSzZKNOdqyqwtZQVlqwxcQX56V63RCHNNSE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-1 hover:scale-[1.02] transition-all duration-300 shadow-2xl hover:shadow-blue-500/50">
              <div className="bg-background rounded-[22px] p-12 md:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon name="MessageCircle" size={36} className="text-white" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Присоединяйся к Max
                  </h3>
                  <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Эксклюзивный контент, новости и общение с фанатами
                  </p>
                  <div className="inline-flex items-center gap-3 text-lg font-semibold text-blue-500 group-hover:gap-5 transition-all">
                    <span>Открыть Max</span>
                    <Icon name="ArrowRight" size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Форум
            </h3>
            <p className="text-lg text-muted-foreground">Последние сообщения от наших слушателей</p>
          </div>

          {forumMessages.length > 0 ? (
            <div className="space-y-3 mb-8">
              {forumMessages.map((msg) => (
                <Card
                  key={msg.id}
                  className="border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/forum?topic=${msg.topic_id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${['from-primary to-secondary','from-pink-500 to-rose-500','from-violet-500 to-purple-500','from-blue-500 to-cyan-500','from-emerald-500 to-teal-500'][Math.abs([...msg.author_name].reduce((a,c)=>c.charCodeAt(0)+((a<<5)-a),0)) % 5]} flex items-center justify-center shrink-0`}>
                        <span className="text-white font-bold text-sm">{msg.author_name[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.author_name}</span>
                          <span className="text-xs text-muted-foreground">
                            в теме <span className="text-primary group-hover:underline">{msg.topic_title}</span>
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 mb-8">
              <Icon name="MessageSquare" size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Пока нет сообщений — будьте первым!</p>
            </div>
          )}

          <div className="text-center">
            <Button onClick={() => navigate('/forum')} className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Icon name="MessageSquare" size={16} />
              Перейти на форум
            </Button>
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
                <a href="mailto:post@nargizamail.ru" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 justify-center md:justify-start">
                  <Icon name="Mail" size={18} />
                  post@nargizamail.ru
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