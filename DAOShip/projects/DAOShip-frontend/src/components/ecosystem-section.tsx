
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";

const ecosystemItems = [
  {
    name: "Algorand Foundation",
    logo: "https://placehold.co/100x100?text=A",
    description: "Official foundation supporting the Algorand ecosystem and network growth",
    category: "Infrastructure",
    status: "active"
  },
  {
    name: "AlgoFi",
    logo: "https://placehold.co/100x100?text=AF",
    description: "DeFi platform offering lending, borrowing and automated market making",
    category: "DeFi",
    status: "active"
  },
  {
    name: "Pera Wallet",
    logo: "https://placehold.co/100x100?text=PW",
    description: "Mobile wallet for the Algorand blockchain with a focus on simplicity",
    category: "Wallet",
    status: "active"
  },
  {
    name: "Algorand NFT Marketplace",
    logo: "https://placehold.co/100x100?text=NFT",
    description: "Platform for digital collectibles powered by Algorand's technology",
    category: "NFT",
    status: "active"
  },
  {
    name: "AlgoDesk",
    logo: "https://placehold.co/100x100?text=AD",
    description: "Multi-functional tools platform for Algorand blockchain users",
    category: "Tools",
    status: "active"
  },
  {
    name: "Tinyman",
    logo: "https://placehold.co/100x100?text=TM",
    description: "Decentralized exchange built on Algorand blockchain",
    category: "DEX",
    status: "active"
  },
  {
    name: "Folks Finance",
    logo: "https://placehold.co/100x100?text=FF",
    description: "Liquid staking and lending protocol on Algorand",
    category: "DeFi",
    status: "active"
  },
  {
    name: "Vestige",
    logo: "https://placehold.co/100x100?text=V",
    description: "NFT marketplace and creator platform for digital assets",
    category: "NFT",
    status: "active"
  }
];

const EcosystemSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = sectionRef.current?.querySelectorAll('.ecosystem-card');
            cards?.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('opacity-100', 'translate-y-0');
                card.classList.remove('opacity-0', 'translate-y-10');
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
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
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-daoship-purple/5"></div>
      <div className="algorand-blob w-[600px] h-[600px] bg-daoship-blue/5 animate-blob-move -left-96 top-1/2"></div>
      <div className="algorand-blob w-[500px] h-[500px] bg-daoship-mint/5 animate-blob-move delay-1000 -right-64 top-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <span className="text-sm font-medium">Ecosystem Partners</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Connected to the <span className="text-daoship-purple">Algorand</span> Ecosystem
          </h2>
          
          <p className="text-lg text-daoship-text-gray/80">
            DAOShip integrates with leading platforms and services in the Algorand ecosystem to provide a seamless experience.
          </p>
        </div>
        
        <div ref={carouselRef} className="w-full overflow-hidden px-4 py-12">
          <div className="flex flex-wrap justify-center gap-8">
            {ecosystemItems.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "ecosystem-card opacity-0 translate-y-10 transition-all duration-500",
                  "w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <GlassmorphicCard className="h-full p-6 transition-all duration-300 hover:-translate-y-2 glass-card-hover relative">
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-daoship-text-gray capitalize">{item.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-daoship-purple/20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-daoship-blue/20 text-daoship-blue rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-daoship-text-gray leading-relaxed">{item.description}</p>
                </GlassmorphicCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSection;
