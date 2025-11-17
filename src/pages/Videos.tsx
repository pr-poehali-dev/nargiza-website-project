import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

const Videos = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
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
    if (videos.length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'video-schema';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": videos.map((video, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "VideoObject",
            "name": video.title,
            "description": video.description || `Клип ${video.title} от NARGIZA`,
            "thumbnailUrl": video.thumbnail,
            "uploadDate": video.publishedAt,
            "contentUrl": `https://www.youtube.com/watch?v=${video.videoId}`,
            "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
            "publisher": {
              "@type": "Organization",
              "name": "NARGIZA",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.poehali.dev/files/13c938ba-9097-4030-8363-e259d96ee6f7.jpg"
              }
            }
          }
        }))
      });
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById('video-schema');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [videos]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>Клипы NARGIZA — Смотреть все видео онлайн | Официальный сайт</title>
      <meta name="description" content="Смотрите все клипы NARGIZA онлайн. Последние видео с YouTube канала @nargizamuz — новые релизы, хиты и эксклюзивные премьеры." />
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border animate-fade-in">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')}>
              NARGIZA
            </h1>
            
            <div className="flex gap-4 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="text-xs font-medium gap-2"
              >
                <span className="text-base">{language === 'ru' ? '🇬🇧' : '🇷🇺'}</span>
                {language === 'ru' ? 'EN' : 'RU'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
                {t('videos.back')}
              </Button>
              <Button variant="ghost" size="icon" asChild className="hover:scale-110 transition-transform">
                <a href="https://t.me/+S_nWXyBTkcI0MzQy" target="_blank" rel="noopener noreferrer">
                  <Icon name="Send" size={20} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Icon name="Instagram" size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Icon name="Youtube" size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Icon name="Music" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('videos.title')}
            </h1>
          </div>
          
          {isLoadingVideos ? (
            <div className="text-center text-muted-foreground py-24 animate-pulse">
              <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
              {t('videos.loading')}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {videos.map((video, index) => (
                <div 
                  key={video.videoId} 
                  className="group aspect-video rounded-lg overflow-hidden animate-scale-in shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Videos;