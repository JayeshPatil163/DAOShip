import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Discord, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-lg py-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="text-2xl font-bold text-white mb-4 block gradient-text">DAOShip</Link>
            <p className="text-daoship-text-gray/80">
              Create, deploy, and manage DAOs on the Algorand blockchain with ease.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/create-dao" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Create DAO</Link></li>
              <li><Link to="/explore" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Explore DAOs</Link></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Governance</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Token Management</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Documentation</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">FAQ</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors flex items-center">
                Algorand Docs
                <ExternalLink className="ml-1 h-3 w-3" />
              </a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-daoship-text-gray/80 text-sm">
            &copy; {new Date().getFullYear()} DAOShip. Built on <a href="https://algorand.com" target="_blank" rel="noopener noreferrer" className="text-daoship-purple hover:underline">Algorand</a>.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors text-sm">Status</a>
            <a href="#" className="text-daoship-text-gray/80 hover:text-daoship-blue transition-colors text-sm">Feedback</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;