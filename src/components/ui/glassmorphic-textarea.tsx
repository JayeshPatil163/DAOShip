import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  className?: string;
  containerClassName?: string;
  error?: string;
}

const GlassmorphicTextarea = forwardRef<HTMLTextAreaElement, GlassmorphicTextareaProps>(
  ({ label, className, containerClassName, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== "" && props.value !== undefined;

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <label
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none text-white/70",
            (isFocused || hasValue) ? "top-2 text-xs" : "top-6 text-sm"
          )}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "glass-input rounded-lg py-4 px-4 w-full pt-6 text-white focus:text-white min-h-[120px] resize-y",
            error && "border-daoship-red",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-daoship-red">{error}</p>
        )}
      </div>
    );
  }
);

GlassmorphicTextarea.displayName = "GlassmorphicTextarea";

export default GlassmorphicTextarea;