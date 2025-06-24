import React from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
}

const GlassmorphicCard = ({
  children,
  className,
  glowEffect = false,
}: GlassmorphicCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        glowEffect && "glow-effect",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;