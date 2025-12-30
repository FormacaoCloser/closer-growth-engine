import { useState } from "react";
import { ChevronDown, Lock, CheckCircle } from "lucide-react";
import { LessonItem } from "./LessonItem";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_duration_seconds: number | null;
  is_free: boolean;
  sort_order: number;
  isCompleted: boolean;
  watchedSeconds: number;
}

interface ModuleAccordionProps {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
  isAvailable: boolean;
  dripMessage: string;
  defaultOpen?: boolean;
  currentLessonId?: string;
}

export function ModuleAccordion({
  id,
  title,
  description,
  lessons,
  isAvailable,
  dripMessage,
  defaultOpen = false,
  currentLessonId,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const completedCount = lessons.filter(l => l.isCompleted).length;
  const totalCount = lessons.length;
  const isModuleComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div className={cn(
      "border border-border rounded-lg overflow-hidden transition-colors",
      !isAvailable && "opacity-75"
    )}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left transition-colors",
          isAvailable ? "hover:bg-muted/50" : "cursor-default",
          isOpen && "bg-muted/30"
        )}
        disabled={!isAvailable}
      >
        {/* Status Icon */}
        {!isAvailable ? (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : isModuleComplete ? (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        )}

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {title}
          </h3>
          {!isAvailable && dripMessage && (
            <p className="text-sm text-amber-500 mt-0.5">{dripMessage}</p>
          )}
          {isAvailable && description && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Chevron */}
        {isAvailable && (
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )} />
        )}
      </button>

      {/* Lessons List */}
      {isOpen && isAvailable && (
        <div className="border-t border-border">
          {lessons
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                {...lesson}
                isActive={lesson.id === currentLessonId}
                index={index + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}
