import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  totalLessons: number;
  completedLessons: number;
  totalWatchedSeconds: number;
  progressPercent: number;
}

export function CourseCard({
  title,
  description,
  slug,
  thumbnail_url,
  totalLessons,
  completedLessons,
  totalWatchedSeconds,
  progressPercent,
}: CourseCardProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Link to={`/aluno/curso/${slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {thumbnail_url ? (
            <img 
              src={thumbnail_url} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Progress Overlay */}
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
              <div className="flex items-center gap-2 text-sm">
                <PlayCircle className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{progressPercent}% concluído</span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercent} className="h-2" />

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{completedLessons}/{totalLessons} aulas</span>
            </div>
            {totalWatchedSeconds > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(totalWatchedSeconds)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
