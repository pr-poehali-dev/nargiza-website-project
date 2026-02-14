import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const STREAM_URL = 'http://130.49.148.73:1030';

const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio(STREAM_URL);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
    });

    const tryAutoplay = async () => {
      try {
        await audio.play();
      } catch {
        setAutoplayBlocked(true);
      }
    };

    tryAutoplay();

    return () => {
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        audioRef.current.src = STREAM_URL;
        await audioRef.current.play();
      } catch {
        setAutoplayBlocked(true);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {showVolume && (
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2 animate-fade-in">
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
      )}

      <button
        onClick={togglePlay}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowVolume(!showVolume);
        }}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        className={`
          relative w-14 h-14 rounded-full shadow-lg border border-border
          flex items-center justify-center transition-all duration-300
          ${isPlaying
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25'
            : 'bg-card text-foreground hover:bg-card/90'
          }
          ${autoplayBlocked ? 'animate-pulse' : ''}
          hover:scale-110 active:scale-95
        `}
        title={isPlaying ? 'Остановить радио' : 'Включить радио'}
      >
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
        )}
        <Icon
          name={isPlaying ? 'Pause' : 'Radio'}
          size={22}
        />
      </button>
    </div>
  );
};

export default RadioPlayer;
