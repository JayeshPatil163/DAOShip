import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import GradientButton from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import {
  Wallet,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sparkles,
  Github,
  ExternalLink,
} from "lucide-react";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/hooks/firebase"; // Ensure this matches your Firebase configuration file path
import WalletConnectModal from "@/components/wallet-connect-modal";
import {
  connectWallet,
  disconnectWallet,
  getWalletAddress,
} from "@/lib/wallet";
import { formatWalletAddress } from "@/lib/utils";

const Navigation = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isGitHubMenuOpen, setIsGitHubMenuOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [actualGitHubUsername, setActualGitHubUsername] = useState(''); // Add this for actual GitHub username
  const [userProfile, setUserProfile] = useState(null);
  const [gitHubLoading, setGitHubLoading] = useState(false);

  // Use the GitHub auth hook
  const { user, connectGitHub, disconnectGitHub, getUserData, loading: authLoading } = useGitHubAuth();

  // Determine if GitHub is connected
  const isGitHubConnected = !!user;

//   const provider = new GithubAuthProvider();
//   signInWithPopup(auth, provider).then(async (result) => {
//   const credential = GithubAuthProvider.credentialFromResult(result);
//   const token = credential?.accessToken;

//   if (token) {
//     const response = await fetch('https://api.github.com/user', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     const data = await response.json();
//     setActualGitHubUsername(data.login); // this is the actual GitHub username
//   }
// });
  
  useEffect(() => {
    if (user) {
      // Set display name for UI
      setGithubUsername(user.displayName || user.email?.split('@')[0] || 'User');
      console.log('GitHub User:', githubUsername);
      // Extract actual GitHub username from providerData or additionalUserInfo
      // This depends on how your GitHub auth is set up
      const githubProvider = user.providerData?.find(provider => provider.providerId === 'github.com');
      if (githubProvider) {
        // If the provider data contains the GitHub username
        setActualGitHubUsername(githubProvider.uid || githubProvider.displayName || '');
      }

      // Fetch additional user data from Firestore if needed
      fetchUserProfile(user.uid);
    } else {
      setGithubUsername('');
      setActualGitHubUsername('');
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async (uid) => {
    try {
      const userData = await getUserData(uid);
      if (userData) {
        setUserProfile(userData);
        setGithubUsername(userData.githubUsername || userData.displayName || 'User');
        // Set actual GitHub username from stored data
        setActualGitHubUsername(userData.githubUsername || userData.actualGithubUsername || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const toggleGitHubMenu = () => {
    setIsGitHubMenuOpen(!isGitHubMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isGitHubMenuOpen && !event.target.closest('.github-menu-container')) {
        setIsGitHubMenuOpen(false);
      }
      if (isProfileMenuOpen && !event.target.closest('.wallet-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGitHubMenuOpen, isProfileMenuOpen]);

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Initialize wallet on component mount
  useEffect(() => {
    const initWallet = async () => {
      const address = await getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    };
    initWallet();
  }, []);

  // Handle GitHub connection
  const handleGitHubConnect = async () => {
    try {
      setGitHubLoading(true);

      toast({
        title: "Connecting to GitHub",
        description: "Please complete the authentication process...",
      });

      const result = await connectGitHub();

      if (result && result.success) {
        toast({
          title: "GitHub Connected",
          description: "Successfully connected to GitHub!",
        });
      } else {
        throw new Error(result?.error || 'Connection failed');
      }
    } catch (error) {
      console.error('GitHub connection failed:', error);
      
    } finally {
      setGitHubLoading(false);
    }
  };

  const handleGitHubDisconnect = async () => {
    try {
      setGitHubLoading(true);
      await disconnectGitHub();
      setIsGitHubMenuOpen(false);

      toast({
        title: "GitHub Disconnected",
        description: "Successfully disconnected from GitHub",
      });
    } catch (error) {
      console.error('GitHub disconnect failed:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGitHubLoading(false);
    }
  };

  // Update wallet disconnect handler
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setIsConnected(false);
      setWalletAddress("");
      setIsProfileMenuOpen(false);

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update wallet connection handler
  const handleWalletConnect = async (walletType: string) => {
    setIsModalOpen(false);

    try {
      toast({
        title: "Connecting Wallet",
        description: `Connecting to ${walletType}...`,
      });

      const address = await connectWallet();
      setWalletAddress(address);
      setIsConnected(true);

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to get the correct GitHub profile URL
  const getGitHubProfileUrl = () => {
    // Priority order: actualGitHubUsername > userProfile.githubUsername > fallback
    const username = actualGitHubUsername ||
                    userProfile?.githubUsername ||
                    userProfile?.actualGithubUsername;

    if (!username) {
      console.warn('No GitHub username found for profile URL');
      return '#'; // Return # to prevent navigation
    }

    return `https://github.com/${username}`;
  };

  // Navigation animations
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const logoVariants = {
    initial: { textShadow: "0 0 5px #00bbff" },
    animate: {
      textShadow: ["0 0 5px #00bbff", "0 0 15px #00bbff", "0 0 5px #00bbff"],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Create DAO", path: "/create-dao" },
  ];

  // Determine loading state for GitHub
  const isGitHubLoading = gitHubLoading || authLoading;

  return (
    <nav
      className={cn(
        "w-full fixed top-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-black/30 py-2 shadow-lg"
          : "backdrop-blur-lg bg-black/20 py-4"
      )}
    >
      <motion.div
        className="container mx-auto px-4 flex justify-between items-center"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <Link to="/" className="flex items-center">
          <motion.div
            className="mr-2"
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Sparkles className="h-6 w-6 text-daoship-primary" />
          </motion.div>
          <motion.div
            className="text-2xl font-bold"
            initial="initial"
            animate="animate"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              DAOShip
            </span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div key={item.path} variants={navItemVariants}>
              <Link
                to={item.path}
                className={cn(
                  "text-white hover:text-daoship-primary transition-colors relative",
                  location.pathname === item.path && "text-daoship-primary"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-daoship-primary"
                    layoutId="navIndicator"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}

          <div className="flex items-center space-x-3">
            {/* GitHub Authentication Button */}
            {isGitHubConnected ? (
              <div className="relative github-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleGitHubMenu}
                  disabled={isGitHubLoading}
                  className="flex items-center bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-2 rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50"
                >
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <Github className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {isGitHubLoading ? 'Loading...' : githubUsername}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-1 transition-transform",
                      isGitHubMenuOpen && "transform rotate-180"
                    )}
                  />
                </motion.button>

                <AnimatePresence>
                  {isGitHubMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg p-1 z-50 border border-white/10"
                    >
                      <motion.div
                        className="px-4 py-3 border-b border-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="text-sm text-white/70">GitHub Account</div>
                        <div className="font-medium text-white truncate">
                          {githubUsername}
                        </div>
                        {user?.email && (
                          <div className="text-xs text-white/50 truncate">
                            {user.email}
                          </div>
                        )}
                      </motion.div>
                      <div className="py-1">
                        {/* Fixed GitHub profile link */}
                        {(actualGitHubUsername || userProfile?.githubUsername) ? (
                          <a
                            href={getGitHubProfileUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                            onClick={() => setIsGitHubMenuOpen(false)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View GitHub Profile
                          </a>
                        ) : (
                          <div className="flex items-center px-4 py-2 text-sm text-white/50 rounded-md cursor-not-allowed">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            GitHub Profile (N/A)
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setIsGitHubMenuOpen(false);
                            // Navigate to profile page
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Account Settings
                        </button>
                        <button
                          onClick={handleGitHubDisconnect}
                          disabled={isGitHubLoading}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isGitHubLoading ? 'Disconnecting...' : 'Disconnect GitHub'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div variants={navItemVariants}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGitHubConnect}
                  disabled={isGitHubLoading}
                  className="flex items-center bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-2 rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50"
                >
                  <Github className="mr-2 h-4 w-4" />
                  {isGitHubLoading ? 'Connecting...' : 'Connect GitHub'}
                </motion.button>
              </motion.div>
            )}

            {/* Wallet Connection Button */}
            {isConnected ? (
              <div className="relative wallet-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <span className="mr-1 font-mono text-sm">
                    {formatWalletAddress(walletAddress)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isProfileMenuOpen && "transform rotate-180"
                    )}
                  />
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg p-1 z-10 border border-white/10"
                    >
                      <motion.div
                        className="px-4 py-3 border-b border-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="text-sm text-white/70">Connected as</div>
                        <div className="font-medium text-white truncate">
                          {walletAddress}
                        </div>
                      </motion.div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={handleDisconnect}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div variants={navItemVariants}>
                <GradientButton
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </GradientButton>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <motion.div className="md:hidden" variants={navItemVariants}>
          <motion.button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute w-full bg-black/80 backdrop-blur-xl border-t border-white/10"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <motion.div className="px-4 py-4 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  variants={navItemVariants}
                  custom={index}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "block py-2 text-white hover:text-daoship-primary transition-colors",
                      location.pathname === item.path && "text-daoship-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile GitHub Button */}
              <motion.div variants={navItemVariants} custom={navItems.length}>
                {isGitHubConnected ? (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                      <span className="text-white">{githubUsername}</span>
                    </div>
                    <button
                      onClick={handleGitHubDisconnect}
                      disabled={isGitHubLoading}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGitHubConnect}
                    disabled={isGitHubLoading}
                    className="w-full flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-2 rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    {isGitHubLoading ? 'Connecting...' : 'Connect GitHub'}
                  </button>
                )}
              </motion.div>

              {/* Mobile Wallet Button */}
              {isConnected ? (
                <motion.div variants={navItemVariants} custom={navItems.length + 1}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                      <span className="text-white font-mono text-sm">
                        {formatWalletAddress(walletAddress)}
                      </span>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={navItemVariants} custom={navItems.length + 1}>
                  <GradientButton
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </GradientButton>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </nav>
  );
};

export default Navigation;
