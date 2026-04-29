import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export default function ExpandableText({ text, maxLength = 150, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className="space-y-1">
      <div 
        className={cn(
          className, 
          isExpanded ? "max-h-[30vh] overflow-y-auto pr-2" : "line-clamp-2"
        )}
      >
        {text}
      </div>
      <Button 
        variant="link" 
        size="sm" 
        className="h-auto p-0 text-xs font-medium text-primary cursor-pointer hover:underline hover:text-primary/80 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? "Show less" : "Read more"}
      </Button>
    </div>
  );
}
