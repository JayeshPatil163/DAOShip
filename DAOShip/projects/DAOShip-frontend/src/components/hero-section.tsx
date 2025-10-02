
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GradientButton from "@/components/ui/gradient-button";
import { Plus, ArrowRight, Clock, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      const blobs = containerRef.current.querySelectorAll('.algorand-blob');
      blobs.forEach((blob, index) => {
        const factor = (index + 1) * 10;
        const blobElement = blob as HTMLElement;
        blobElement.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden py-20">
      {/* Background blobs */}
      <div className="algorand-blob w-[400px] h-[400px] bg-daoship-purple animate-blob-move left-[10%] top-[20%]"></div>
      <div className="algorand-blob w-[500px] h-[500px] bg-daoship-blue animate-blob-move delay-1000 right-[10%] top-[30%]"></div>
      <div className="algorand-blob w-[300px] h-[300px] bg-daoship-mint animate-blob-move delay-2000 left-[30%] bottom-[10%]"></div>
      
      {/* Background particles */}
      {Array.from({ length: 40 }).map((_, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-white/10 animate-particle-move"
          style={{
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 20 + 10}s`,
          }}
        ></div>
      ))}

      <div className="container mx-auto px-4 z-10 mt-16 md:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="text-sm font-medium flex items-center">
                <span className="h-2 w-2 rounded-full bg-daoship-mint mr-2 animate-pulse"></span>
                Powered by Algorand
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-float leading-tight">
              Build <span className="text-daoship-purple">Decentralized</span> Communities
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-daoship-text-gray max-w-2xl leading-relaxed">
              Create, deploy and manage DAOs on Algorand in minutes. Join the decentralized governance revolution without writing a single line of code.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <GradientButton 
                onClick={() => navigate("/create-dao")} 
                className="text-base md:text-lg"
                glowEffect
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create a DAO
              </GradientButton>
              
              <GradientButton
                onClick={() => navigate("/explore")}
                className="text-base md:text-lg"
                variant="secondary"
                size="lg"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Explore DAOs
              </GradientButton>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-daoship-purple mb-1">120+</span>
                <span className="text-sm text-white/60">Active DAOs</span>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-daoship-purple mb-1">5k+</span>
                <span className="text-sm text-white/60">Community Members</span>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-daoship-purple mb-1">10M+</span>
                <span className="text-sm text-white/60">ALGO Managed</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute w-72 h-72 rounded-full bg-daoship-purple/30 filter blur-3xl animate-rotate-slow"></div>
            
            <GlassmorphicCard className="relative z-10 max-w-md mx-auto p-8" glowEffect>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-primary rounded-2xl rotate-12 animate-bounce-subtle"></div>
              <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-daoship-mint/40 rounded-full backdrop-blur-sm animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
              
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Ready to Build?
              </h2>
              
              <p className="text-daoship-text-gray mb-8">
                Leverage the power of Algorand's fast, secure, and sustainable blockchain with our intuitive tools.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-daoship-purple/20 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-daoship-purple" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white">Lightning Fast</h4>
                    <p className="text-sm text-white/60">Deploy in minutes, not days</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-daoship-purple/20 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-daoship-purple" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white">Carbon-Negative</h4>
                    <p className="text-sm text-white/60">Sustainable blockchain technology</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-daoship-purple/20 p-2 rounded-full">
                    <Zap className="h-4 w-4 text-daoship-purple" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-white">No-Code Solution</h4>
                    <p className="text-sm text-white/60">User-friendly for all skill levels</p>
                  </div>
                </div>
              </div>
              
              <GradientButton 
                onClick={() => navigate("/create-dao")} 
                className="w-full"
                glowEffect
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Building Now
              </GradientButton>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Abstract decorative shapes */}
      <div className="hidden md:block absolute bottom-10 left-10 w-32 h-32 border-4 border-daoship-purple/20 rounded-full"></div>
      <div className="hidden md:block absolute top-16 right-16 w-24 h-24 border-4 border-daoship-mint/20 rounded-full"></div>
      <div className="hidden md:block absolute bottom-32 right-[10%] w-16 h-16 border-2 border-daoship-blue/30 rounded-md rotate-45"></div>
    </div>
  );
};

export default HeroSection;
