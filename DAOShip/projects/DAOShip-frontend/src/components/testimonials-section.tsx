
import React, { useEffect, useRef, useState } from "react";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "DAOShip made it incredibly easy to set up our community DAO. The process was intuitive and we were up and running in less than an hour.",
    author: "Sarah Johnson",
    title: "Community Lead, AlgoNFT Project",
    avatar: "https://placehold.co/100x100?text=SJ",
    rating: 5,
  },
  {
    quote: "The governance tools provided by DAOShip have transformed how our collective makes decisions. Everything is transparent and efficient.",
    author: "Michael Chen",
    title: "Founder, Algo Developers Alliance",
    avatar: "https://placehold.co/100x100?text=MC",
    rating: 5,
  },
  {
    quote: "We've tried several DAO platforms, but DAOShip's integration with Algorand offers the best performance and lowest fees by far.",
    author: "Elena Rodriguez",
    title: "Operations Director, DeFi Collective",
    avatar: "https://placehold.co/100x100?text=ER",
    rating: 5,
  },
  {
    quote: "The analytics dashboard gives us incredible insights into our governance process that we didn't have before. Game-changing tool.",
    author: "Thomas Wright",
    title: "Data Analyst, Crypto Research Group",
    avatar: "https://placehold.co/100x100?text=TW",
    rating: 4,
  },
  {
    quote: "DAOShip's token distribution tools made our community launch seamless. Couldn't imagine doing this without their platform.",
    author: "Aisha Patel",
    title: "Community Manager, TokenTech",
    avatar: "https://placehold.co/100x100?text=AP",
    rating: 5,
  },
  {
    quote: "The mobile-first approach and clean UI made it easy for our non-technical members to participate in governance.",
    author: "Jake Morrison",
    title: "CTO, BlockChain Gaming Guild",
    avatar: "https://placehold.co/100x100?text=JM",
    rating: 5,
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && slidesRef.current) {
          slidesRef.current.classList.add('opacity-100');
          slidesRef.current.classList.remove('opacity-0');
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    const updateSlideWidth = () => {
      if (slidesRef.current) {
        const firstSlide = slidesRef.current.querySelector('.testimonial-slide');
        if (firstSlide) {
          setSlideWidth(firstSlide.clientWidth);
        }
      }
    };
    
    updateSlideWidth();
    window.addEventListener('resize', updateSlideWidth);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      window.removeEventListener('resize', updateSlideWidth);
    };
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      {/* Background design elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-daoship-purple/5"></div>
      <div className="algorand-blob w-[400px] h-[400px] bg-daoship-purple/5 animate-blob-move right-0 bottom-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
            <span className="text-sm font-medium">Success Stories</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            What Our <span className="text-daoship-purple">Users</span> Say
          </h2>
          
          <p className="text-lg text-daoship-text-gray/80">
            Communities and projects that have transformed their governance with DAOShip
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Carousel navigation */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20">
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Testimonials carousel */}
          <div 
            ref={slidesRef}
            className="relative overflow-hidden opacity-0 transition-opacity duration-1000"
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="testimonial-slide flex-shrink-0 w-full"
                >
                  <GlassmorphicCard className="p-8 md:p-10">
                    <div className="mb-6">
                      <svg className="w-10 h-10 text-daoship-purple/60" fill="currentColor" viewBox="0 0 32 32">
                        <path d="M10 8c-2.2 0-4 1.8-4 4v10h10V12H9.8c0-1.1.9-2 2-2h.2V8h-2zm12 0c-2.2 0-4 1.8-4 4v10h10V12h-6.2c0-1.1.9-2 2-2h.2V8h-2z"></path>
                      </svg>
                    </div>
                    
                    <p className="text-xl md:text-2xl font-light mb-6 text-white leading-relaxed">
                      "{testimonial.quote}"
                    </p>

                    {/* Star rating */}
                    <div className="flex items-center mb-6">
                      {[...Array(5)].map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`w-5 h-5 ${
                            starIndex < testimonial.rating
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-daoship-text-gray">
                        ({testimonial.rating}/5)
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.author} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{testimonial.author}</h4>
                        <p className="text-sm text-daoship-text-gray">{testimonial.title}</p>
                      </div>
                    </div>
                  </GlassmorphicCard>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex 
                    ? "bg-daoship-purple w-6" 
                    : "bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
