
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-lg py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="text-2xl font-bold text-white mb-4 block gradient-text">DAOShip</Link>
            <p className="text-daoship-text-gray">
              Create, deploy, and manage DAOs on the Algorand blockchain with ease.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/create-dao" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">Create DAO</Link></li>
              <li><Link to="/explore" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">Explore DAOs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/documentation" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">Documentation</Link></li>
              <li><Link to="/faq" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">Twitter</a></li>
              <li><a href="https://discord.gg/A3XVukbK" target="_blank" rel="noopener noreferrer" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">Discord</a></li>
              <li><a href="https://github.com/Aniketwarule/DAOShip" target="_blank" rel="noopener noreferrer" className="text-daoship-text-gray hover:text-daoship-blue transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-daoship-text-gray text-sm">
            &copy; {new Date().getFullYear()} DAOShip. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-daoship-text-gray hover:text-daoship-blue transition-colors text-sm">Terms</Link>
            <Link to="/privacy" className="text-daoship-text-gray hover:text-daoship-blue transition-colors text-sm">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
