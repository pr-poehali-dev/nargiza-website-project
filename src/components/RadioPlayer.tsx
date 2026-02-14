import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const PROXY_URL = 'https://functions.poehali.dev/daa3b167-1f44-4b41-b7f3-1328e7b93115';

const RadioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const fetchingRef = useRef(false);
  const stoppedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const fetchChunk = useCallback(async () => {
    if (fetchingRef.current || stoppedRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await fetch(PROXY_URL);
      if (!response.ok) throw new Error('Stream error');

      const arrayBuffer = await response.arrayBuffer();
      const sb = sourceBufferRef.current;

      if (sb && !sb.updating && mediaSourceRef.current?.readyState === 'open') {
        sb.appendBuffer(arrayBuffer);
      }
    } catch (e) {
      console.error('Radio chunk error:', e);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const startStream = useCallback(async () => {
    stoppedRef.current = false;
    setIsLoading(true);

    if (!window.MediaSource) {
      setIsLoading(false);
      return;
    }

    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const ms = new MediaSource();
    mediaSourceRef.current = ms;
    audio.src = URL.createObjectURL(ms);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb = ms.addSourceBuffer('audio/mpeg');
        sourceBufferRef.current = sb;

        sb.addEventListener('updateend', () => {
          if (!stoppedRef.current) {
            setTimeout(fetchChunk, 100);
          }
        });

        await fetchChunk();
        setIsLoading(false);

        try {
          await audio.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (_e) {
          setAutoplayBlocked(true);
          setIsPlaying(false);
        }
      } catch (e) {
        console.error('MediaSource error:', e);
        setIsLoading(false);
      }
    });
  }, [volume, fetchChunk]);

  const stopStream = useCallback(() => {
    stoppedRef.current = true;
    fetchingRef.current = false;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (mediaSourceRef.current?.readyState === 'open') {
      try { mediaSourceRef.current.endOfStream(); } catch (_e) { /* stream already closed */ }
    }
    mediaSourceRef.current = null;
    sourceBufferRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (isPlaying) {
      stopStream();
    } else {
      await startStream();
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