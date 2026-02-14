import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const STREAM_URL = 'http://130.49.148.73:1040/stream';

const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      setIsLoading(false);
    });
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('error', () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = '';
    } else {
      setIsLoading(true);
      audio.src = STREAM_URL;
      try {
        await audio.play();
      } catch {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-b border-border/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`
              relative w-12 h-12 rounded-full shrink-0
              flex items-center justify-center transition-all duration-300
              ${isPlaying
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted text-foreground hover:bg-muted/80'
              }
              hover:scale-110 active:scale-95
              disabled:opacity-50
            `}
          >
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            )}
            <Icon name={isLoading ? 'Loader2' : isPlaying ? 'Pause' : 'Play'} size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <div className="flex items-end gap-[3px] h-4">
                  <span className="w-[3px] bg-primary rounded-full animate-bounce" style={{ height: '60%', animationDuration: '0.6s' }} />
                  <span className="w-[3px] bg-primary rounded-full animate-bounce" style={{ height: '100%', animationDuration: '0.8s', animationDelay: '0.1s' }} />
                  <span className="w-[3px] bg-primary rounded-full animate-bounce" style={{ height: '40%', animationDuration: '0.7s', animationDelay: '0.2s' }} />
                  <span className="w-[3px] bg-primary rounded-full animate-bounce" style={{ height: '80%', animationDuration: '0.5s', animationDelay: '0.15s' }} />
                </div>
              )}
              <Icon name="Radio" size={18} className={isPlaying ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">NARGIZA Radio</span>
              <span className="text-xs text-muted-foreground truncate">
                {isLoading ? 'Загрузка...' : isPlaying ? 'В эфире' : 'Остановлено'}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Icon name="Volume1" size={14} className="text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 accent-primary cursor-pointer"
            />
            <Icon name="Volume2" size={14} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;