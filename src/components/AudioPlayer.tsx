import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  trackName: string;
  previewUrl?: string;
}

const AudioPlayer = ({ trackName, previewUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!previewUrl) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon name="Music" size={14} />
        <span>Превью недоступно</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
      <audio ref={audioRef} src={previewUrl} />
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={togglePlay}
      >
        <Icon name={isPlaying ? 'Pause' : 'Play'} size={16} />
      </Button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate mb-1">{trackName}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;