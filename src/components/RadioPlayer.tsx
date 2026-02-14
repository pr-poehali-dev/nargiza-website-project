import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const PROXY_URL = 'https://functions.poehali.dev/daa3b167-1f44-4b41-b7f3-1328e7b93115';

const RadioPlayer = () => {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<'A' | 'B'>('A');
  const stoppedRef = useRef(false);
  const blobUrlsRef = useRef<string[]>([]);
  const prefetchedBlobRef = useRef<Blob | null>(null);
  const isFetchingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const cleanupBlobUrl = (url: string) => {
    URL.revokeObjectURL(url);
    blobUrlsRef.current = blobUrlsRef.current.filter(u => u !== url);
  };

  const fetchChunk = async (): Promise<Blob | null> => {
    if (stoppedRef.current) return null;
    try {
      const response = await fetch(PROXY_URL);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  };

  const prefetchNext = useCallback(async () => {
    if (stoppedRef.current || isFetchingRef.current || prefetchedBlobRef.current) return;
    isFetchingRef.current = true;
    const blob = await fetchChunk();
    if (blob && !stoppedRef.current) {
      prefetchedBlobRef.current = blob;
    }
    isFetchingRef.current = false;
  }, []);

  const getActiveAudio = useCallback(() => {
    return activeRef.current === 'A' ? audioARef.current : audioBRef.current;
  }, []);

  const getInactiveAudio = useCallback(() => {
    return activeRef.current === 'A' ? audioBRef.current : audioARef.current;
  }, []);

  const playChunk = useCallback(async (blob?: Blob | null) => {
    if (stoppedRef.current) return;
    setIsLoading(true);

    let audioBlob = blob || prefetchedBlobRef.current;
    prefetchedBlobRef.current = null;

    if (!audioBlob) {
      audioBlob = await fetchChunk();
    }

    if (!audioBlob || stoppedRef.current) {
      setIsLoading(false);
      if (!stoppedRef.current) {
        setTimeout(() => playChunk(), 3000);
      }
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    blobUrlsRef.current.push(url);

    const audio = getActiveAudio();
    if (!audio) return;

    audio.volume = volume;
    audio.src = url;

    const handleTimeUpdate = () => {
      if (audio.duration && audio.currentTime > audio.duration * 0.5) {
        prefetchNext();
      }
    };

    const handleEnded = () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      cleanupBlobUrl(url);

      if (!stoppedRef.current) {
        activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
        playChunk();
      }
    };

    const handleError = () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      cleanupBlobUrl(url);

      if (!stoppedRef.current) {
        setTimeout(() => playChunk(), 2000);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    setIsLoading(false);

    try {
      await audio.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, [volume, getActiveAudio, prefetchNext]);

  const stopStream = useCallback(() => {
    stoppedRef.current = true;
    prefetchedBlobRef.current = null;
    isFetchingRef.current = false;

    [audioARef.current, audioBRef.current].forEach(audio => {
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.onended = null;
        audio.onerror = null;
      }
    });

    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    audioARef.current = new Audio();
    audioBRef.current = new Audio();

    stoppedRef.current = false;
    playChunk();

    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    [audioARef.current, audioBRef.current].forEach(audio => {
      if (audio) audio.volume = volume;
    });
  }, [volume]);

  const togglePlay = async () => {
    if (isPlaying) {
      stopStream();
    } else {
      stoppedRef.current = false;
      await playChunk();
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
              ${autoplayBlocked ? 'animate-pulse' : ''}
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
                {isLoading ? 'Загрузка...' : isPlaying ? 'В эфире' : autoplayBlocked ? 'Нажмите Play' : 'Остановлено'}
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