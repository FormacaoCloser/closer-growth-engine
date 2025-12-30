import { PlayCircle, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  id: string;
  title: string;
  description: string | null;
  video_duration_seconds: number | null;
  is_free: boolean;
  isCompleted: boolean;
  watchedSeconds: number;
  isActive?: boolean;
  index: number;
}

export function LessonItem({
  id,
  title,
  video_duration_seconds,
  is_free,
  isCompleted,
  watchedSeconds,
  isActive,
  index,
}: LessonItemProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = video_duration_seconds && watchedSeconds > 0
    ? Math.min(100, Math.round((watchedSeconds / video_duration_seconds) * 100))
    : 0;

  return (
    <Link
      to={`/aluno/aula/${id}`}
      className={cn(
        "flex items-center gap-3 p-4 transition-colors border-b border-border last:border-b-0",
        isActive 
          ? "bg-primary/10 border-l-2 border-l-primary" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Status/Number */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isCompleted 
          ? "bg-primary/20" 
          : isActive 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
      )}>
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-primary" />
        ) : (
          <span className={cn(
            "text-sm font-medium",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}>
            {index}
          </span>
        )}
      </div>

      {/* Title & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-medium truncate",
            isActive && "text-primary"
          )}>
            {title}
          </h4>
          {is_free && (
            <span className="px-1.5 py-0.5 text-xs bg-accent/20 text-accent rounded">
              Grátis
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        {progressPercent > 0 && !isCompleted && (
          <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-primary/50 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Duration */}
      {video_duration_seconds && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDuration(video_duration_seconds)}</span>
        </div>
      )}

      {/* Play Icon */}
      <PlayCircle className={cn(
        "w-5 h-5 flex-shrink-0",
        isActive ? "text-primary" : "text-muted-foreground"
      )} />
    </Link>
  );
}
