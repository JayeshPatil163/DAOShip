
import React, { useEffect, useRef } from "react";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import { Settings, Vote, Shield, Wallet, Zap, Activity, Users, BarChart3 } from "lucide-react";

const featuresData = [
  {
    title: "Simple Setup",
    description: "Launch your DAO in minutes with our intuitive interface. No coding needed.",
    icon: Settings,
    color: "bg-gradient-to-br from-daoship-purple to-blue-600",
    badge: "Popular",
  },
  {
    title: "Flexible Governance",
    description: "Customize voting periods, quorum percentages, and create proposals using Algorand's powerful consensus mechanism.",
    icon: Vote,
    color: "bg-gradient-to-br from-blue-500 to-daoship-mint",
    badge: "Core Feature",
  },
  {
    title: "Secure on Algorand",
    description: "Built on Algorand's fast, secure, and carbon-negative blockchain technology — perfect for sustainable projects.",
    icon: Shield,
    color: "bg-gradient-to-br from-daoship-mint to-green-500",
    badge: "Eco-Friendly",
  },
  {
    title: "Token Management",
    description: "Create and distribute governance tokens seamlessly with built-in Algorand Standard Asset (ASA) integration.",
    icon: Wallet,
    color: "bg-gradient-to-br from-yellow-500 to-daoship-yellow",
    badge: "Essential",
  },
  {
    title: "Fast Transactions",
    description: "Experience almost instant finality and microtransactions with Algorand's cutting-edge Pure Proof-of-Stake protocol.",
    icon: Zap,
    color: "bg-gradient-to-br from-orange-500 to-red-500",
    badge: "Lightning Fast",
  },
  {
    title: "Real-time Analytics",
    description: "Monitor DAO activities, proposal status, and voting trends with our comprehensive dashboard.",
    icon: Activity,
    color: "bg-gradient-to-br from-purple-600 to-blue-500",
    badge: "Pro Feature",
  },
  {
    title: "Member Management",
    description: "Invite members, manage roles, and track participation with advanced member management tools.",
    icon: Users,
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    badge: "Community",
  },
  {
    title: "Advanced Reports",
    description: "Generate detailed reports on governance performance, member engagement, and treasury management.",
    icon: BarChart3,
    color: "bg-gradient-to-br from-indigo-500 to-purple-600",
    badge: "Enterprise",
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = sectionRef.current?.querySelectorAll('.feature-card');
            cards?.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add('opacity-100', 'translate-y-0');
                card.classList.remove('opacity-0', 'translate-y-10');
              }, i * 100);
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
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="algorand-blob w-[600px] h-[600px] bg-daoship-purple/10 animate-blob-move -left-72 -top-72"></div>
        <div className="algorand-blob w-[500px] h-[500px] bg-daoship-blue/10 animate-blob-move delay-1000 right-0 top-0"></div>
        <div className="algorand-blob w-[700px] h-[700px] bg-daoship-mint/10 animate-blob-move delay-2000 -right-96 -bottom-96"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Built for <span className="text-daoship-purple">Blockchain</span> Innovation
          </h2>
          
          <p className="text-lg text-daoship-text-gray/80">
            Leverage the power of Algorand with our comprehensive suite of tools designed specifically for builders and creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card opacity-0 translate-y-10 transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <GlassmorphicCard
                className="h-full p-6 text-center transform transition-all duration-300 hover:-translate-y-2 glass-card-hover relative"
              >
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-daoship-purple to-daoship-blue text-white text-xs px-3 py-1 rounded-full font-medium">
                    {feature.badge}
                  </span>
                </div>

                <div className="flex justify-center mb-4 mt-2">
                  <div className={`p-3 rounded-xl ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-sm text-daoship-text-gray leading-relaxed">{feature.description}</p>
              </GlassmorphicCard>
            </div>
          ))}
        </div>
      </div>
      
      {/* Abstract decorative elements */}
      <div className="absolute bottom-10 right-10 w-40 h-40 border border-white/10 rounded-full"></div>
      <div className="absolute top-40 left-10 w-20 h-20 border border-white/10 rounded-full"></div>
    </section>
  );
};

export default FeaturesSection;
