import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioPlayer from '@/components/AudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';

interface Track {
  name: string;
  previewUrl?: string;
}

const Albums = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'albums-schema';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      "name": "NARGIZA",
      "url": "https://nargiza.poehali.dev/albums",
      "album": albums.map(album => ({
        "@type": "MusicAlbum",
        "name": album.title,
        "datePublished": album.year.toString(),
        "image": album.cover,
        "description": album.description,
        "numTracks": album.tracks.length,
        "byArtist": {
          "@type": "MusicGroup",
          "name": "NARGIZA"
        }
      }))
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('albums-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const albums = [
    {
      id: 'nikchemnaya-zhizn',
      title: 'Никчёмная жизнь',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/f8cf36c7-61da-4d88-a041-6b50d15f1795.jpg',
      description: 'Первый полноценный альбом NARGIZA, отражающий глубокие личные переживания и философские размышления о жизни, одиночестве и современном обществе.',
      tracks: [
        { name: 'Когда ты один', previewUrl: '' },
        { name: 'Пустой экран', previewUrl: '' },
        { name: 'Никто не ждёт (Сл. A.Nevskiy)', previewUrl: '' },
        { name: 'Никчёмная жизнь', previewUrl: '' },
        { name: 'Когда никто не ищет', previewUrl: '' },
        { name: 'Всё проходит (Сл. Ю.Левитанский)', previewUrl: '' },
        { name: 'Мы тратим время', previewUrl: '' },
        { name: 'Забудешь', previewUrl: '' },
        { name: 'Мне нечем заняться', previewUrl: '' },
        { name: 'Одно и то же', previewUrl: '' },
        { name: 'Вся суть', previewUrl: '' },
        { name: 'Молодо зелено', previewUrl: '' },
        { name: 'Земной путь', previewUrl: '' },
        { name: 'Смартфон', previewUrl: '' },
        { name: 'Это другая я', previewUrl: '' }
      ] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/38836368',
        apple: 'https://music.apple.com/tr/album/%D0%BD%D0%B8%D0%BA%D1%87%D1%91%D0%BC%D0%BD%D0%B0%D1%8F-%D0%B6%D0%B8%D0%B7%D0%BD%D1%8C/1848552571',
        spotify: 'https://open.spotify.com/album/2LhOw0UIUtiSxa5DVOpJ7e'
      }
    },
    {
      id: 'vojna',
      title: 'Война',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/62f9edc7-7584-4b56-a28d-1a06c9006ac9.jpg',
      description: 'Новый альбом NARGIZA, посвящённый военной теме и патриотизму. Глубокие размышления о судьбе страны и народа в трудное время.',
      tracks: [
        { name: 'Вступление (Война)', previewUrl: '' },
        { name: 'Живым вернуться (Сл. Е.Сараевой)', previewUrl: '' },
        { name: 'Родина (Сл. В. Своеволина)', previewUrl: '' },
        { name: 'СВО начало (Сл. С.Анищенко)', previewUrl: '' },
        { name: 'Брат (Сл. О. Расуловой)', previewUrl: '' },
        { name: 'Непокорный Донбасс (Сл. Ю. Неупокоева)', previewUrl: '' },
        { name: 'Я убит (Сл. NARGIZA)', previewUrl: '' },
        { name: 'Сапёр (Сл. С. Шешукова)', previewUrl: '' },
        { name: 'Вставай рать (Сл. Р. Симаника)', previewUrl: '' },
        { name: 'На рассвете (Сл. NARGIZA)', previewUrl: '' },
        { name: 'Катится мир куда-то (Сл. С. Шешукова)', previewUrl: '' },
        { name: 'Не могу (Сл. Aleksandr Nevskiy)', previewUrl: '' },
        { name: 'Возвращайся братишка (Сл. О.Расуловой)', previewUrl: '' },
        { name: 'Мы будем ждать (Сл. Е. Ревякиной)', previewUrl: '' },
        { name: 'Вставай народ (Сл. NARGIZA)', previewUrl: '' },
        { name: 'Нас нет в живых (Сл. NARGIZA)', previewUrl: '' }
      ] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/38802888',
        apple: 'https://music.apple.com/us/album/%D0%B2%D0%BE%D0%B9%D0%BD%D0%B0/1848125403?l=ru',
        spotify: 'https://open.spotify.com/album/1Ycq0ZGx7ErIrDszrobSCb'
      }
    },
    {
      id: 'ukraina',
      title: 'Украина',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/997e91e7-bf77-4ecd-9ef7-c7dc49e57b6c.jpg',
      description: 'Альбом, посвящённый военной теме и поддержке России. Создан исполнительницей как личный вклад в поддержку страны в трудное время.',
      tracks: [
        { name: 'Вступление', previewUrl: '' },
        { name: 'Майдан', previewUrl: '' },
        { name: 'Западенцы', previewUrl: '' },
        { name: 'Под Славянском', previewUrl: '' },
        { name: 'Ополченец', previewUrl: '' },
        { name: 'Гражданская война', previewUrl: '' },
        { name: 'Олесь Бузина (Не люблю)', previewUrl: '' },
        { name: 'Не добили', previewUrl: '' },
        { name: 'Мама (И. Самарина)', previewUrl: '' },
        { name: 'Донбасс', previewUrl: '' },
        { name: 'Ночь над Донбассом', previewUrl: '' },
        { name: 'В окопе (С. Ведринцев)', previewUrl: '' },
        { name: 'Не добили (remix)', previewUrl: '' },
        { name: 'Доброта', previewUrl: '' },
        { name: 'Заключение', previewUrl: '' }
      ] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/34508644',
        apple: 'https://music.apple.com/us/album/%D1%83%D0%BA%D1%80%D0%B0%D0%B8%D0%BD%D0%B0/1837641653?l=ru',
        spotify: 'https://open.spotify.com/album/3yxSUITLKbKNPJHTML8pzWIbOE'
      }
    },
    {
      id: 'kursk',
      title: 'Курск',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/486199a3-efae-4aa9-864a-e3468118227c.jpg',
      description: 'Новый альбом NARGIZA, посвящённый памяти и мужеству. Глубокие эмоциональные композиции о событиях и людях.',
      tracks: [
        { name: 'Курск - начало', previewUrl: '' },
        { name: 'Вторжение', previewUrl: '' },
        { name: 'Пограничник', previewUrl: '' },
        { name: 'Недобитки', previewUrl: '' },
        { name: 'На балконе', previewUrl: '' },
        { name: 'Расскажи солдат', previewUrl: '' },
        { name: 'Слова на стене', previewUrl: '' },
        { name: 'Посёлок', previewUrl: '' },
        { name: 'Курск', previewUrl: '' },
        { name: 'Украинский солдат', previewUrl: '' },
        { name: 'Я солдат России', previewUrl: '' },
        { name: 'Поклон тебе, солдат России', previewUrl: '' }
      ] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/38462651',
        apple: 'https://music.apple.com/us/album/%D0%BA%D1%83%D1%80%D1%81%D0%BA/1843294959?l=ru',
        spotify: 'https://open.spotify.com/album/3GwTzsH0oU86UE5OcplXyW'
      }
    },
    {
      id: 'russia-i-sila',
      title: 'Россия и Сила',
      year: 2025,
      cover: 'https://cdn.poehali.dev/files/9d266639-3b22-41f7-ad15-bb485bc0ed3d.jpg',
      description: 'Новый альбом NARGIZA, продолжающий военно-патриотическую тематику. Мощные композиции о силе духа и любви к Родине.',
      tracks: [
        { name: 'Начало', previewUrl: '' },
        { name: 'Россия', previewUrl: '' },
        { name: 'ЧВК Вагнер', previewUrl: '' },
        { name: 'Бахмут', previewUrl: '' },
        { name: 'Родина в огне', previewUrl: '' },
        { name: 'Штурмовик Вагнера', previewUrl: '' },
        { name: 'Граната', previewUrl: '' },
        { name: 'Первомайское', previewUrl: '' },
        { name: 'Ещё не осень', previewUrl: '' },
        { name: 'Бой в рукопашную', previewUrl: '' },
        { name: 'Последняя роль', previewUrl: '' }
      ] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/37929631',
        apple: 'https://music.apple.com/tr/album/%D1%80%D0%BE%D1%81%D1%81%D0%B8%D1%8F-%D0%B8-%D1%81%D0%B8%D0%BB%D0%B0/1835214816',
        spotify: 'https://open.spotify.com/album/1FNBtYguD2PAiohUxRlD28'
      }
    }
  ];

  useEffect(() => {
    document.title = t('meta.albums.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('meta.albums.description'));
    }
    document.documentElement.lang = language;
  }, [language, t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold tracking-tight cursor-pointer" 
              onClick={() => navigate('/')}
            >
              NARGIZA
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className="text-xs font-medium gap-2"
              >
                <span className="text-base">{language === 'ru' ? '🇬🇧' : '🇷🇺'}</span>
                {language === 'ru' ? 'EN' : 'RU'}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                {t('albums.back')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl font-bold mb-12 animate-slide-up">{t('albums.title')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {albums.map((album) => (
              <Card 
                key={album.id} 
                className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow"
              >
                <div 
                  className="h-64 bg-cover bg-center relative cursor-pointer"
                  style={{ backgroundImage: `url('${album.cover}')` }}
                  onClick={() => setExpandedAlbum(expandedAlbum === album.id ? null : album.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-3xl font-bold text-white drop-shadow-lg">{album.title}</h3>
                    <p className="text-white/80 text-sm">{album.year}</p>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('albums.about')}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedAlbum(expandedAlbum === album.id ? null : album.id)}
                    >
                      <Icon 
                        name={expandedAlbum === album.id ? "ChevronUp" : "ChevronDown"} 
                        size={20} 
                      />
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {album.description}
                  </p>

                  {expandedAlbum === album.id && album.tracks.length > 0 && (
                    <div className="mb-6 animate-fade-in">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="ListMusic" size={18} />
                        {t('albums.tracklist')} ({album.tracks.length})
                      </h4>
                      <div className="space-y-3">
                        {album.tracks.map((track, i) => (
                          <div key={i}>
                            {playingTrack === `${album.id}-${i}` ? (
                              <AudioPlayer 
                                trackName={`${i + 1}. ${track.name}`}
                                previewUrl={track.previewUrl}
                              />
                            ) : (
                              <div 
                                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors p-3 rounded hover:bg-accent cursor-pointer"
                                onClick={() => setPlayingTrack(`${album.id}-${i}`)}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 flex-shrink-0"
                                >
                                  <Icon name="Play" size={16} />
                                </Button>
                                <span className="text-xs font-mono w-6 text-right">{i + 1}.</span>
                                <Icon name="Music" size={14} className="text-secondary" />
                                <span>{track.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={album.links.yandex} target="_blank" rel="noopener noreferrer">
                        <Icon name="Music" size={16} />
                        {t('albums.listenOn')} Яндекс.Музыке
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={album.links.apple} target="_blank" rel="noopener noreferrer">
                        <Icon name="Music" size={16} />
                        {t('albums.listenOn')} Apple Music
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={album.links.spotify} target="_blank" rel="noopener noreferrer">
                        <Icon name="Music" size={16} />
                        {t('albums.listenOn')} Spotify
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Albums;