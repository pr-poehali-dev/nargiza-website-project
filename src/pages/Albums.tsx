import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AudioPlayer from '@/components/AudioPlayer';

interface Track {
  name: string;
  previewUrl?: string;
}

const Albums = () => {
  const navigate = useNavigate();
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
      cover: 'https://cdn.poehali.dev/files/c8124c8a-fb2c-4862-a097-7ed5dfeb16e2.jpg',
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
      id: 'ukraina',
      title: 'Украина',
      year: 2024,
      cover: 'https://cdn.poehali.dev/files/8c740a4e-930e-4ca5-9e0d-8f576693c135.jpg',
      description: 'Альбом, посвящённый военной теме и поддержке России. Создан исполнительницей как личный вклад в поддержку страны в трудное время.',
      tracks: [] as Track[],
      links: {
        yandex: 'https://music.yandex.ru/album/ALBUM_ID',
        apple: 'https://music.apple.com/album/ALBUM_ID',
        spotify: 'https://open.spotify.com/album/ALBUM_ID'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <title>Альбомы NARGIZA — Слушать онлайн | Официальный сайт</title>
      <meta name="description" content="Все альбомы NARGIZA: Никчёмная жизнь, Calla Vivid, Украина. Слушайте полные треки на Яндекс.Музыке, Apple Music, Spotify." />
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold tracking-tight cursor-pointer" 
              onClick={() => navigate('/')}
            >
              NARGIZA
            </h1>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl font-bold mb-12 animate-slide-up">Альбомы</h2>
          
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
                    <span>О альбоме</span>
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
                        Треклист ({album.tracks.length})
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
                        Яндекс Музыка
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={album.links.apple} target="_blank" rel="noopener noreferrer">
                        <Icon name="Music" size={16} />
                        Apple Music
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={album.links.spotify} target="_blank" rel="noopener noreferrer">
                        <Icon name="Music" size={16} />
                        Spotify
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