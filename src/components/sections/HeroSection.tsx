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

interface HeroSectionProps {
  videos: YouTubeVideo[];
  isLoadingVideos: boolean;
  animatedStats: { total: number; last24h: number };
}

const HeroSection = ({ videos, isLoadingVideos, animatedStats }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <img
        src="https://cdn.poehali.dev/files/05bfe7e6-f1fa-4ae6-833a-39cca4ceb2e2.jpg"
        alt="Nargiza"
        className="absolute inset-0 w-full h-full object-cover"
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

        <div className="flex gap-6 justify-center mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24">
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
  );
};

export default HeroSection;
