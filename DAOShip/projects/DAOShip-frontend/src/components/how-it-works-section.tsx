
import React, { useEffect, useRef } from "react";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description: "Link your Algorand wallet securely to get started with DAOShip. We support Pera Wallet, MyAlgo and more.",
    delay: 0,
    icon: "🔗",
  },
  {
    number: "02", 
    title: "Create Your DAO",
    description: "Set up governance parameters, issue your token on Algorand, and customize voting rules to fit your community's needs.",
    delay: 200,
    icon: "🏗️",
  },
  {
    number: "03",
    title: "Start Governing",
    description: "Create proposals, vote on important decisions, and manage your decentralized community with seamless UX.",
    delay: 400,
    icon: "🗳️",
  },
  {
    number: "04",
    title: "Scale & Grow",
    description: "Invite members, delegate voting power, and expand your community while maintaining transparent governance.",
    delay: 600,
    icon: "📈",
  },
];

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = sectionRef.current?.querySelectorAll('.step-item');
            steps?.forEach((step, i) => {
              setTimeout(() => {
                step.classList.add('opacity-100', 'translate-y-0');
                step.classList.remove('opacity-0', 'translate-y-20');
              }, i * 200);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      {/* Background graphics */}
      <div className="absolute inset-0 bg-gradient-background">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="a" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="#0FA0CE" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,1000 L1000,1000 L1000,0 L0,0 Z" fill="url(#a)"></path>
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <span className="text-sm font-medium">Simple Process</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            How <span className="text-daoship-purple">DAOShip</span> Works
          </h2>
          
          <p className="text-lg text-daoship-text-gray/80">
            Building a decentralized autonomous organization has never been easier.
            Our streamlined process gets you from idea to functioning DAO in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-daoship-purple via-daoship-blue to-daoship-mint transform -translate-y-1/2 z-0"></div>
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="step-item opacity-0 translate-y-20 transition-all duration-700 ease-out relative z-10"
              style={{ transitionDelay: `${step.delay}ms` }}
            >
              <GlassmorphicCard className="p-6 relative h-full">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mb-6 glow-border">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                
                <div className="pt-8 text-center">
                  <span className="text-sm font-mono text-daoship-blue mb-2 block">{step.number}</span>
                  <h3 className="text-lg font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-sm text-daoship-text-gray leading-relaxed">{step.description}</p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-daoship-purple/30 rounded-full blur-md"></div>
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-daoship-mint/30 rounded-full blur-sm"></div>
              </GlassmorphicCard>
            </div>
          ))}
        </div>
      </div>

      {/* Particle effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white/5 animate-particle-move"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
            }}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
