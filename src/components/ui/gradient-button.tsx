import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "success";
  size?: "default" | "sm" | "lg";
  className?: string;
  glowEffect?: boolean;
}

const GradientButton = ({
  children,
  variant = "primary",
  size = "default",
  className,
  glowEffect = false,
  ...props
}: GradientButtonProps) => {
  
  const variantClasses = {
    primary: "bg-gradient-primary text-white hover:shadow-[0_4px_20px_-2px_rgba(15,160,206,0.4)]",
    secondary: "bg-transparent border border-white/30 hover:bg-white/10 text-white",
    destructive: "bg-gradient-to-r from-daoship-red to-red-600 text-white",
    success: "bg-gradient-to-r from-daoship-mint to-green-400 text-slate-900"
  };
  
  const sizeClasses = {
    default: "px-6 py-2 text-base",
    sm: "px-4 py-1 text-sm",
    lg: "px-8 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center",
        variantClasses[variant],
        sizeClasses[size],
        glowEffect && "hover:animate-pulse-glow",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;