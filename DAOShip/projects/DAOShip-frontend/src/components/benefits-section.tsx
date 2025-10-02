
import React, { useEffect, useRef } from "react";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GradientButton from "@/components/ui/gradient-button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const BenefitsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.2 }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-radial from-daoship-purple/30 to-transparent opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-radial from-daoship-mint/10 to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
            <GlassmorphicCard className="p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-daoship-purple/30 to-transparent rounded-full blur-2xl transform translate-x-1/4 -translate-y-1/4"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-8 gradient-text">
                Why Algorand for Your<br />Hackathon Project?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-daoship-purple/20">
                      <CheckCircle className="h-4 w-4 text-daoship-purple" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Carbon-Negative Blockchain</h4>
                    <p className="text-daoship-text-gray/80">
                      Algorand is the first carbon-negative blockchain, making it perfect for sustainable and eco-friendly applications.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-daoship-purple/20">
                      <CheckCircle className="h-4 w-4 text-daoship-purple" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Pure Proof-of-Stake</h4>
                    <p className="text-daoship-text-gray/80">
                      Algorand's Pure Proof-of-Stake consensus mechanism provides security, scalability, and instant finality.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-daoship-purple/20">
                      <CheckCircle className="h-4 w-4 text-daoship-purple" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Layer-1 Smart Contracts</h4>
                    <p className="text-daoship-text-gray/80">
                      Algorand Smart Contracts (ASC1) are powerful, secure, and cost-effective for building decentralized applications.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-daoship-purple/20">
                      <CheckCircle className="h-4 w-4 text-daoship-purple" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Developer-Friendly SDK</h4>
                    <p className="text-daoship-text-gray/80">
                      Comprehensive SDKs in Python, JavaScript, Go, and Java make development smooth and efficient.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <GradientButton
                  onClick={() => navigate("/create-dao")}
                  size="lg"
                >
                  Start Building Now
                </GradientButton>
              </div>
            </GlassmorphicCard>
          </div>
          
          <div>
            <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100 space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text leading-tight">
                Unleash the Power of <span className="text-daoship-purple">Decentralized</span> Governance
              </h2>
              
              <p className="text-xl text-daoship-text-gray/80">
                DAOShip makes it simple to create and manage decentralized autonomous organizations on the Algorand blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-daoship-purple mb-2">4.5s</div>
                  <p className="text-sm text-white/70">Transaction Finality</p>
                </div>
                
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-daoship-purple mb-2">6,000+</div>
                  <p className="text-sm text-white/70">TPS Capacity</p>
                </div>
                
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-daoship-purple mb-2">$0.001</div>
                  <p className="text-sm text-white/70">Avg Transaction Fee</p>
                </div>
                
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-daoship-purple mb-2">0</div>
                  <p className="text-sm text-white/70">Carbon Footprint</p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src="https://placehold.co/800x500/0FA0CE/FFFFFF/png?text=Algorand+Ecosystem" 
                  alt="Algorand Ecosystem" 
                  className="w-full h-auto object-cover rounded-2xl opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h4 className="text-white text-xl font-bold">Join the Algorand Ecosystem</h4>
                  <p className="text-white/80">Build the future of decentralized finance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
