import { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface SmartVideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  displayProgress: number;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

export function SmartVideoPlayer({
  videoUrl,
  posterUrl,
  displayProgress,
  isPlaying,
  onPlayPause,
  onTimeUpdate,
}: SmartVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Use refs to keep callbacks stable and avoid re-registering event listeners
  const onPlayPauseRef = useRef(onPlayPause);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onPlayPauseRef.current = onPlayPause;
    onTimeUpdateRef.current = onTimeUpdate;
  });

  // Register event listeners only once
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdateRef.current(video.currentTime, video.duration);
    };

    const handlePlay = () => onPlayPauseRef.current(true);
    const handlePause = () => onPlayPauseRef.current(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Hide controls after 3 seconds of no interaction when playing
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    const timeout = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  return (
    <div 
      className="relative w-full aspect-video bg-background/50 rounded-2xl overflow-hidden border border-border/30 shadow-2xl group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={posterUrl}
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        // Placeholder when no video
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-10 h-10 text-primary ml-1" />
            </div>
            <p className="text-muted-foreground text-sm">Vídeo em breve</p>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div 
        className={`absolute inset-0 flex items-center justify-center bg-background/30 transition-opacity duration-300 cursor-pointer ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={togglePlay}
      >
        {!isPlaying && (
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Smart Progress Bar */}
        <div className="w-full h-1 bg-muted rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress * 100}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            )}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
