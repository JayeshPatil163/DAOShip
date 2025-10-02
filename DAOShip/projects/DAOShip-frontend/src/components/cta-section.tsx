
import React from "react";
import { useNavigate } from "react-router-dom";
import GradientButton from "@/components/ui/gradient-button";
import { ArrowRight } from "lucide-react";

const CtaSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-daoship-purple/5 to-black/0"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-daoship-purple/30 to-transparent"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white/5 animate-particle-move"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text leading-tight">
            Start Your Decentralized Journey Today
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-daoship-text-gray max-w-2xl mx-auto">
            Join hundreds of communities already building their DAOs on Algorand with our platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <GradientButton 
              onClick={() => navigate("/create-dao")} 
              size="lg"
              glowEffect
              className="text-xl px-10 transform transition-transform hover:scale-105"
            >
              Create Your DAO
            </GradientButton>
            
            <GradientButton
              onClick={() => navigate("/explore")}
              variant="secondary"
              size="lg"
              className="text-xl px-10"
            >
              Explore Communities
              <ArrowRight className="ml-2 h-5 w-5" />
            </GradientButton>
          </div>
          
          <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-6 text-white/60">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-daoship-purple/20 flex items-center justify-center mr-2">
                <div className="w-2 h-2 rounded-full bg-daoship-purple"></div>
              </div>
              <span>Fast & Secure</span>
            </div>
            
            <div className="hidden md:block h-4 w-px bg-white/10"></div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-daoship-purple/20 flex items-center justify-center mr-2">
                <div className="w-2 h-2 rounded-full bg-daoship-purple"></div>
              </div>
              <span>Carbon-Negative</span>
            </div>
            
            <div className="hidden md:block h-4 w-px bg-white/10"></div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-daoship-purple/20 flex items-center justify-center mr-2">
                <div className="w-2 h-2 rounded-full bg-daoship-purple"></div>
              </div>
              <span>Community Focused</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
