import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  CircleDashed,
  ChevronRight,
  Sparkles,
  Activity,
  Eye,
  BarChart4,
  FileText,
  Settings,
  ArrowUpRight,
  User, // Import User icon for creator/manager
  Link as LinkIcon, // Import Link icon for github repo
  Coins, // For token details
  Github, // For GitHub related displays
  Code, // For contributions
  GitCommit, // For commits
  GitPullRequest, // For pull requests
  Bug, // For issues
  MessageSquareText, // For code reviews
} from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GradientButton from "@/components/ui/gradient-button";
import { getDAO, getDAOProposals } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

// Interface definitions (remain the same)
interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
}

interface GitHubCollaborator {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  contributions?: {
    commits: number;
    pullRequests: number;
    issues: number;
    codeReviews: number;
  };
  allocatedTokens?: number;
}

interface GitHubContributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface DAO {
  _id: string;
  name: string;
  description: string;
  creator: { username: string; walletAddress: string; _id: string } | string;
  manager: string;
  contractAddress: string;
  votePrice: number;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  votingPeriod: number;
  quorum: number;
  minTokens: number;
  githubRepo?: string;
  tokenStrategy: 'fixed' | 'dynamic' | 'hybrid';
  initialDistribution: {
    commits: number;
    pullRequests: number;
    issues: number;
    codeReviews: number;
  };
  tokenAllocation: {
    initialDistribution: number;
    futureContributors: number;
    treasury: number;
  };
  contributionRewards: {
    newPR: number;
    acceptedPR: number;
    issueCreation: number;
    codeReview: number;
  };
  vestingPeriod: number;
  minContributionForVoting: number;
  invitedCollaborators: string[];
  members: Array<{
    username?: string;
    walletAddress: string;
    _id: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GITHUB_TOKEN = "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"; // REPLACE WITH YOUR ACTUAL TOKEN OR SECURELY FETCH

const DAODashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [dao, setDao] = useState<DAO | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [githubContributors, setGithubContributors] = useState<GitHubContributor[]>([]);
  const [githubCollaborators, setGithubCollaborators] = useState<GitHubCollaborator[]>([]);
  const [isFetchingGithubData, setIsFetchingGithubData] = useState(false);
  const [githubDataError, setGithubDataError] = useState<string | null>(null);

  const [tabHovered, setTabHovered] = useState("");
  const { toast } = useToast();
  const { walletAddress } = useWallet();

  // --- START: Move all helper functions and callbacks here ---

  // Helper to parse GitHub repo owner and name from URL
  const parseGitHubUrl = useCallback((url: string) => {
    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(regex);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }, []);

  // Function to fetch GitHub contributions (simplified for commits)
  const fetchGitHubUserContributions = useCallback(async (owner: string, repo: string, username: string) => {
    try {
      const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      } else {
        console.warn("GitHub Token is not set. API requests might be rate-limited or fail for private repos.");
      }

      const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?author=${username}`, { headers });
      const commitsData = await commitsResponse.json();
      const numCommits = Array.isArray(commitsData) ? commitsData.length : 0;

      const prsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&creator=${username}`, { headers });
      const prsData = await prsResponse.json();
      const numPRs = Array.isArray(prsData) ? prsData.length : 0;

      const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&creator=${username}`, { headers });
      const issuesData = await issuesResponse.json();
      const numIssues = Array.isArray(issuesData) ? issuesData.length : 0;

      const numCodeReviews = 0; // Placeholder for code reviews

      return {
        commits: numCommits,
        pullRequests: numPRs,
        issues: numIssues,
        codeReviews: numCodeReviews,
      };
    } catch (error) {
      console.error(`Error fetching contributions for ${username}:`, error);
      return { commits: 0, pullRequests: 0, issues: 0, codeReviews: 0 };
    }
  }, [GITHUB_TOKEN]);

  // Main function to fetch all GitHub data for the DAO
  const fetchAllGitHubData = useCallback(async () => {
    if (!dao?.githubRepo) {
      setGithubDataError("No GitHub repository linked to this DAO.");
      setGithubContributors([]);
      setGithubCollaborators([]);
      return;
    }

    const repoInfo = parseGitHubUrl(dao.githubRepo);
    if (!repoInfo) {
      setGithubDataError("Invalid GitHub repository URL.");
      setGithubContributors([]);
      setGithubCollaborators([]);
      return;
    }

    setIsFetchingGithubData(true);
    setGithubDataError(null);

    try {
      const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      } else {
        console.warn("GitHub Token is not set. API requests might be rate-limited or fail for private repos.");
      }

      const collabsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/collaborators`, { headers });
      if (!collabsResponse.ok) {
        throw new Error(`Failed to fetch collaborators: ${collabsResponse.status} ${collabsResponse.statusText}`);
      }
      const collabsData: GitHubCollaborator[] = await collabsResponse.json();

      const contributorsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contributors`, { headers });
      if (!contributorsResponse.ok) {
        throw new Error(`Failed to fetch contributors: ${contributorsResponse.status} ${contributorsResponse.statusText}`);
      }
      const contributorsData: GitHubContributor[] = await contributorsResponse.json();

      const combinedUsers: { [login: string]: GitHubCollaborator } = {};

      for (const collab of collabsData) {
        const userDetailsResponse = await fetch(collab.url, { headers });
        const userDetails = await userDetailsResponse.json();
        combinedUsers[collab.login] = { ...collab, ...userDetails };
      }

      for (const contributor of contributorsData) {
        if (!combinedUsers[contributor.login]) {
          const userDetailsResponse = await fetch(contributor.url, { headers });
          const userDetails = await userDetailsResponse.json();
          combinedUsers[contributor.login] = { ...contributor, ...userDetails };
        }
      }

      let totalPointsAllContributors = 0;
      for (const user of Object.values(combinedUsers)) {
        const tempContributions = await fetchGitHubUserContributions(repoInfo.owner, repoInfo.repo, user.login);
        totalPointsAllContributors +=
            (tempContributions.commits * (dao?.contributionRewards.newPR || 0)) +
            (tempContributions.pullRequests * (dao?.contributionRewards.acceptedPR || 0)) +
            (tempContributions.issues * (dao?.contributionRewards.issueCreation || 0)) +
            (tempContributions.codeReviews * (dao?.contributionRewards.codeReview || 0));
      }

      const finalCollaboratorsWithContributions: GitHubCollaborator[] = await Promise.all(
        Object.values(combinedUsers).map(async (user) => {
          const contributions = await fetchGitHubUserContributions(repoInfo.owner, repoInfo.repo, user.login);

          const individualContributionPoints =
            (contributions.commits * (dao?.contributionRewards.newPR || 0)) +
            (contributions.pullRequests * (dao?.contributionRewards.acceptedPR || 0)) +
            (contributions.issues * (dao?.contributionRewards.issueCreation || 0)) +
            (contributions.codeReviews * (dao?.contributionRewards.codeReview || 0));

          let allocatedTokens = 0;
          if (dao?.tokenStrategy === 'fixed' && dao?.tokenSupply !== undefined && totalPointsAllContributors > 0) {
            const tokensForInitialDistribution = (dao.tokenAllocation.initialDistribution / 100) * dao.tokenSupply;
            allocatedTokens = (individualContributionPoints / totalPointsAllContributors) * tokensForInitialDistribution;
          } else if (dao?.tokenStrategy === 'dynamic') {
             allocatedTokens = individualContributionPoints;
          }

          return { ...user, contributions, allocatedTokens };
        })
      );

      setGithubCollaborators(finalCollaboratorsWithContributions.sort((a, b) => (b.allocatedTokens || 0) - (a.allocatedTokens || 0)));

    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      setGithubDataError(`Failed to fetch GitHub data: ${error.message || String(error)}`);
    } finally {
      setIsFetchingGithubData(false);
    }
  }, [dao, parseGitHubUrl, fetchGitHubUserContributions]);

  // Main function to fetch DAO data from your backend API
  const fetchDAOData = useCallback(async () => {
    try {
      const [daoData, proposalsData] = await Promise.all([
        getDAO(id!),
        getDAOProposals(id),
      ]);
      console.log("daoData fetched:", daoData);
      console.log("proposalsData fetched:", proposalsData);
      setDao(daoData);
      setProposals(proposalsData);
    } catch (error) {
      console.error("Error fetching DAO data:", error);
      toast({
        title: "Error",
        description: "Failed to load DAO data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  // Handle navigation to view a specific proposal
  const handleViewProposal = useCallback((proposalId: string) => {
    navigate(`/dao/${id}/proposal/${proposalId}`);
  }, [navigate, id]);

  // Handle navigation to create a new proposal
  const handleCreateProposal = useCallback(() => {
    navigate(`/dao/${id}/create-proposal`);
  }, [navigate, id]);

  // --- END: Move all helper functions and callbacks here ---


  // ... (useEffect hooks now come after functions they call)

  useEffect(() => {
    if (id) {
      fetchDAOData();
    }
  }, [id, fetchDAOData]);

  useEffect(() => {
    if (activeTab === "members" && dao && dao.githubRepo && !isFetchingGithubData) {
      if (githubCollaborators.length === 0 || githubDataError) {
        fetchAllGitHubData();
      }
    }
  }, [activeTab, dao, fetchAllGitHubData, isFetchingGithubData, githubCollaborators.length, githubDataError]);


  // ... (rest of the component, including animation variants and render logic, remains the same)
  // Animation variants (no changes needed)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const tabVariants = {
    inactive: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "rgba(255, 255, 255, 0.7)",
    },
    active: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      color: "rgba(255, 255, 255, 1)",
      transition: { duration: 0.3 },
    },
    hover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.9)",
      transition: { duration: 0.2 },
    },
  };

  const statisticsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-daoship-primary border-white/30 rounded-full animate-spin mb-4" />
            <p className="text-white">Loading DAO data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassmorphicCard className="p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              DAO Not Found
            </h2>
            <p className="text-daoship-text-gray mb-6">
              We couldn't find the DAO you're looking for.
            </p>
            <Link to="/">
              <GradientButton>Return Home</GradientButton>
            </Link>
          </GlassmorphicCard>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getTotalVotes = (proposal: Proposal) => {
    return proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  };

  const getVotePercentage = (voteCount: number, proposal: Proposal) => {
    const total = getTotalVotes(proposal);
    if (total === 0) return 0;
    return (voteCount / total) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="text-blue-400" />;
      case "passed":
        return <CheckCircle className="text-green-400" />;
      case "failed":
        return <XCircle className="text-red-400" />;
      case "pending":
        return <CircleDashed className="text-yellow-400" />;
      default:
        return <CircleDashed className="text-gray-400" />;
    }
  };

  const activeProposals = proposals.filter((p) => p.status === "active");
  const recentProposals = [...proposals]
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    .slice(0, 5);

  const isDAOAdmin = walletAddress === (dao.creator as any)?.walletAddress || walletAddress === dao.manager;

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {dao.name}
                </h1>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                >
                  <Sparkles className="ml-3 text-daoship-primary w-6 h-6" />
                </motion.div>
              </div>
              <p className="text-daoship-text-gray text-lg mb-1">
                {dao.description.length > 120
                  ? dao.description.substring(0, 120) + "..."
                  : dao.description}
              </p>
              <div className="flex items-center text-daoship-text-gray mt-2">
                <Users className="w-4 h-4 mr-1" />
                <span className="mr-4">{dao.members.length} members</span>
                <Clock className="w-4 h-4 mr-1" />
                <span>Created {formatDate(dao.createdAt)}</span>
              </div>
            </div>
            <motion.div
              className="mt-4 md:mt-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GradientButton onClick={handleCreateProposal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Proposal
              </GradientButton>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {["overview", "proposals", "members", "settings"].map((tab) => (
              <motion.button
                key={tab}
                className={`px-4 py-2 rounded-lg flex items-center capitalize ${
                  activeTab === tab ? "font-medium" : ""
                }`}
                onClick={() => setActiveTab(tab)}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === tab ? "active" : "inactive"}
                whileHover="hover"
                onMouseEnter={() => setTabHovered(tab)}
                onMouseLeave={() => setTabHovered("")}
              >
                {tab === "overview" && <BarChart4 className="w-4 h-4 mr-2" />}
                {tab === "proposals" && <FileText className="w-4 h-4 mr-2" />}
                {tab === "members" && <Users className="w-4 h-4 mr-2" />}
                {tab === "settings" && <Settings className="w-4 h-4 mr-2" />}
                {tab}
                {(activeTab === tab || tabHovered === tab) && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-daoship-primary"
                    layoutId="tabIndicator"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Statistics */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-full bg-blue-500/20 mr-3">
                          <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">
                          Active Proposals
                        </h3>
                      </div>
                      <motion.div
                        className="flex items-end justify-between"
                        variants={statisticsVariants}
                      >
                        <span className="text-3xl font-bold text-white">
                          {activeProposals.length}
                        </span>
                        <span className="text-daoship-text-gray">
                          of {proposals.length} total
                        </span>
                      </motion.div>
                    </GlassmorphicCard>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-full bg-purple-500/20 mr-3">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">
                          Members
                        </h3>
                      </div>
                      <motion.div
                        className="flex items-end justify-between"
                        variants={statisticsVariants}
                      >
                        <span className="text-3xl font-bold text-white">
                          {dao.members.length}
                        </span>
                        <span className="text-daoship-text-gray">
                          voting power
                        </span>
                      </motion.div>
                    </GlassmorphicCard>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-full bg-green-500/20 mr-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">
                          Quorum
                        </h3>
                      </div>
                      <motion.div
                        className="flex items-end justify-between"
                        variants={statisticsVariants}
                      >
                        <span className="text-3xl font-bold text-white">
                          {dao.quorum}%
                        </span>
                        <span className="text-daoship-text-gray">
                          required votes
                        </span>
                      </motion.div>
                    </GlassmorphicCard>
                  </motion.div>
                </motion.div>

                {/* Active Proposals */}
                <motion.div
                  className="mb-10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Active Proposals
                    </h2>
                    <Link
                      to={`/dao/${id}/proposals`}
                      className="text-daoship-primary flex items-center hover:underline"
                    >
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  {activeProposals.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {activeProposals.map((proposal) => (
                        <motion.div
                          key={proposal._id}
                          variants={itemVariants}
                          whileHover="hover"
                          className="cursor-pointer"
                          onClick={() => handleViewProposal(proposal._id)}
                        >
                          <GlassmorphicCard className="p-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                                <h3 className="text-white font-medium text-lg mb-1">
                                  {proposal.title}
                                </h3>
                                <p className="text-daoship-text-gray text-sm line-clamp-2">
                                  {proposal.description}
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                                  <Activity className="w-4 h-4 mr-1" />
                                  {calculateTimeLeft(proposal.endTime)}
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center bg-daoship-primary/80 hover:bg-daoship-primary text-white px-3 py-1 rounded-full text-sm"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View details
                                </motion.button>
                              </div>
                            </div>
                            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-full bg-green-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getVotePercentage(
                                    proposal.yesVotes,
                                    proposal
                                  )}%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-daoship-text-gray">
                              <span>
                                {proposal.yesVotes} Yes (
                                {getVotePercentage(
                                  proposal.yesVotes,
                                  proposal
                                ).toFixed(1)}
                                %)
                              </span>
                              <span>
                                {proposal.noVotes} No (
                                {getVotePercentage(
                                  proposal.noVotes,
                                  proposal
                                ).toFixed(1)}
                                %)
                              </span>
                              <span>{getTotalVotes(proposal)} total votes</span>
                            </div>
                          </GlassmorphicCard>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <GlassmorphicCard className="p-8 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FileText className="w-12 h-12 mx-auto text-daoship-text-gray mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">
                          No Active Proposals
                        </h3>
                        <p className="text-daoship-text-gray mb-6">
                          There are currently no active proposals in this DAO.
                        </p>
                        <GradientButton onClick={handleCreateProposal}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Proposal
                        </GradientButton>
                      </motion.div>
                    </GlassmorphicCard>
                  )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-bold text-white mb-4">
                    Recent Activity
                  </h2>

                  {recentProposals.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {recentProposals.map((proposal, index) => (
                        <motion.div
                          key={proposal._id}
                          variants={itemVariants}
                          custom={index}
                          onClick={() => handleViewProposal(proposal._id)}
                          className="cursor-pointer"
                        >
                          <GlassmorphicCard className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center">
                              <div className="mr-4">
                                {getStatusIcon(proposal.status)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium">
                                  {proposal.title}
                                </h4>
                                <div className="flex items-center text-daoship-text-gray text-sm mt-1">
                                  <span className="mr-4">
                                    {formatDate(proposal.startTime)}
                                  </span>
                                  <span>{getTotalVotes(proposal)} votes</span>
                                </div>
                              </div>
                              <motion.div
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ArrowUpRight className="text-daoship-text-gray w-5 h-5" />
                              </motion.div>
                            </div>
                          </GlassmorphicCard>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <GlassmorphicCard className="p-8 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Activity className="w-12 h-12 mx-auto text-daoship-text-gray mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">
                          No Recent Activity
                        </h3>
                        <p className="text-daoship-text-gray">
                          There hasn't been any recent activity in this DAO.
                        </p>
                      </motion.div>
                    </GlassmorphicCard>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "proposals" && ( // The proposals tab content
              <motion.div
                key="proposals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    All Proposals
                  </h2>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GradientButton onClick={handleCreateProposal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Proposal
                    </GradientButton>
                  </motion.div>
                </div>




                {proposals.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4"
                  >
                    {proposals.map((proposal, index) => (
                      <motion.div
                        key={proposal._id}
                        variants={itemVariants}
                        custom={index}
                        whileHover="hover"
                        className="cursor-pointer"
                        onClick={() => handleViewProposal(proposal._id)}
                      >
                        <GlassmorphicCard className="p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex-1 mb-4 md:mb-0 md:mr-4">
                              <div className="flex items-center mb-2">
                                {getStatusIcon(proposal.status)}
                                <span className="ml-2 text-sm capitalize px-2 py-1 rounded-full bg-white/10">
                                  {proposal.status}
                                </span>
                              </div>
                              <h3 className="text-white font-medium text-lg mb-1">
                                {proposal.title}
                              </h3>
                              <p className="text-daoship-text-gray text-sm line-clamp-2">
                                {proposal.description}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <div className="text-daoship-text-gray text-sm">
                                {formatDate(proposal.startTime)} -{" "}
                                {formatDate(proposal.endTime)}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center bg-daoship-primary/80 hover:bg-daoship-primary text-white px-3 py-1 rounded-full text-sm"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View details
                              </motion.button>
                            </div>
                          </div>
                          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className="flex h-full">
                              <motion.div
                                className="h-full bg-green-500"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getVotePercentage(
                                    proposal.yesVotes,
                                    proposal
                                  )}%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                              <motion.div
                                className="h-full bg-red-500"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getVotePercentage(
                                    proposal.noVotes,
                                    proposal
                                  )}%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                              <motion.div
                                className="h-full bg-gray-500"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getVotePercentage(
                                    proposal.abstainVotes,
                                    proposal
                                  )}%`,
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-daoship-text-gray">
                            <span>
                              {proposal.yesVotes} Yes (
                              {getVotePercentage(
                                proposal.yesVotes,
                                proposal
                              ).toFixed(1)}
                              %)
                            </span>
                            <span>
                              {proposal.noVotes} No (
                              {getVotePercentage(
                                proposal.noVotes,
                                proposal
                              ).toFixed(1)}
                              %)
                            </span>
                            <span>
                              {proposal.abstainVotes} Abstain (
                              {getVotePercentage(
                                proposal.abstainVotes,
                                proposal
                              ).toFixed(1)}
                              %)
                            </span>
                          </div>
                        </GlassmorphicCard>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <GlassmorphicCard className="p-8 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FileText className="w-12 h-12 mx-auto text-daoship-text-gray mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">
                        No Proposals Yet
                      </h3>
                      <p className="text-daoship-text-gray mb-6">
                        This DAO doesn't have any proposals yet. Create the
                        first one!
                      </p>
                      <GradientButton onClick={handleCreateProposal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Proposal
                      </GradientButton>
                    </motion.div>
                  </GlassmorphicCard>
                )}
              </motion.div>
            )}

            {activeTab === "members" && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">DAO Members & Collaborators</h2>
                <GlassmorphicCard className="p-6">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* DAO Creator */}
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">
                      DAO Creator
                    </h3>
                    <div className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center overflow-hidden">
                            <User className="text-white h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-white font-medium">
                              {typeof dao.creator === 'object' ? dao.creator.username : 'Unknown Creator'}
                              {(typeof dao.creator === 'object' && dao.creator.walletAddress === walletAddress) || (dao.creator === walletAddress) && <span className="text-daoship-primary text-xs ml-2">(You)</span>}
                            </h4>
                            <p className="text-daoship-text-gray text-sm">
                              {typeof dao.creator === 'object'
                                ? `${dao.creator.walletAddress.substring(0, 6)}...${dao.creator.walletAddress.substring(dao.creator.walletAddress.length - 4)}`
                                : `${dao.creator.substring(0, 6)}...${dao.creator.substring(dao.creator.length - 4)}`}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                          Creator
                        </div>
                      </div>
                    </div>

                    {/* DAO Manager */}
                    <h3 className="text-xl font-semibold text-white mb-4 mt-6 border-b border-white/10 pb-2">
                      DAO Manager
                    </h3>
                    <div className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center overflow-hidden">
                            <User className="text-white h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-white font-medium">
                              {dao.manager === (dao.creator as any)?.walletAddress ? (typeof dao.creator === 'object' ? dao.creator.username : 'DAO Creator') : 'DAO Manager'}
                              {dao.manager === walletAddress && <span className="text-daoship-primary text-xs ml-2">(You)</span>}
                            </h4>
                            <p className="text-daoship-text-gray text-sm">
                              {`${dao.manager.substring(0, 6)}...${dao.manager.substring(dao.manager.length - 4)}`}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          Manager
                        </div>
                      </div>
                    </div>

                    {/* All Members */}
                    <h3 className="text-xl font-semibold text-white mb-4 mt-6 border-b border-white/10 pb-2">
                      All Members ({dao.members.length})
                    </h3>
                    {dao.members.length > 0 ? (
                      <div className="grid grid-cols-1 divide-y divide-white/10">
                        {dao.members.map((member, index) => (
                          <motion.div
                            key={member._id || member.walletAddress || index}
                            variants={itemVariants}
                            custom={index}
                            className="py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center overflow-hidden">
                                  {member.username ? (
                                    <span className="text-white font-medium">
                                      {member.username.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <Users className="text-white h-5 w-5" />
                                  )}
                                </div>
                                <div className="ml-3">
                                  <h4 className="text-white font-medium">
                                    {member.username || "Anonymous Member"}
                                    {member.walletAddress === walletAddress && <span className="text-daoship-primary text-xs ml-2">(You)</span>}
                                  </h4>
                                  <p className="text-daoship-text-gray text-sm">
                                    {member.walletAddress
                                      ? `${member.walletAddress.substring(
                                        0,
                                        6
                                      )}...${member.walletAddress.substring(
                                        member.walletAddress.length - 4
                                      )}`
                                      : "No address found"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                  1 Voting Power
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-daoship-text-gray text-center py-4">No members in this DAO yet (excluding creator/manager).</p>
                    )}

                    {/* GitHub Collaborators and Contributors */}
                    <h3 className="text-xl font-semibold text-white mb-4 mt-6 border-b border-white/10 pb-2">
                      GitHub Collaborators & Contributors ({githubCollaborators.length})
                    </h3>
                    {!dao.githubRepo ? (
                      <div className="text-daoship-text-gray text-center py-4">
                        No GitHub repository linked to this DAO to fetch collaborators.
                      </div>
                    ) : isFetchingGithubData ? (
                      <div className="text-center py-8">
                        <div className="w-10 h-10 border-4 border-t-daoship-primary border-white/30 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Fetching GitHub data...</p>
                      </div>
                    ) : githubDataError ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                        <p className="text-red-400 text-sm">{githubDataError}</p>
                      </div>
                    ) : githubCollaborators.length > 0 ? (
                      <div className="grid grid-cols-1 divide-y divide-white/10">
                        {githubCollaborators.map((collab) => (
                          <motion.div
                            key={collab.id}
                            variants={itemVariants}
                            className="py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                  <img
                                    src={collab.avatar_url}
                                    alt={`${collab.login}'s avatar`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">
                                    {collab.name || collab.login}
                                    {collab.site_admin && <span className="text-yellow-400 text-xs ml-2">(Admin)</span>}
                                    {dao.invitedCollaborators?.includes(collab.login) && <span className="text-purple-400 text-xs ml-2">(Invited)</span>}
                                  </h4>
                                  <p className="text-daoship-text-gray text-sm">
                                    <a href={collab.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      @{collab.login}
                                    </a>
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end text-sm">
                                <div className="flex items-center text-daoship-text-gray">
                                  <Coins className="w-4 h-4 mr-1 text-daoship-mint" />
                                  <span className="font-bold text-white mr-1">{collab.allocatedTokens?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</span> {dao.tokenSymbol}
                                </div>
                                {collab.contributions && (
                                  <div className="text-xs text-daoship-text-gray mt-1 text-right">
                                    <span className="flex items-center justify-end">
                                      <GitCommit className="w-3 h-3 mr-1" /> {collab.contributions.commits} commits
                                    </span>
                                    <span className="flex items-center justify-end mt-0.5">
                                      <GitPullRequest className="w-3 h-3 mr-1" /> {collab.contributions.pullRequests} PRs
                                    </span>
                                    <span className="flex items-center justify-end mt-0.5">
                                      <Bug className="w-3 h-3 mr-1" /> {collab.contributions.issues} issues
                                    </span>
                                    {/* <span className="flex items-center justify-end mt-0.5">
                                      <MessageSquareText className="w-3 h-3 mr-1" /> {collab.contributions.codeReviews} reviews
                                    </span> */}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-daoship-text-gray text-center py-4">No GitHub collaborators or contributors found for this repository.</p>
                    )}

                    {/* This section now specifically lists invited collaborators who are NOT also detected as GitHub repo contributors/collaborators */}
                    {dao.invitedCollaborators && dao.invitedCollaborators.length > 0 && (
                      <>
                        {(() => {
                          const nonGithubInvited = dao.invitedCollaborators.filter(invitedLogin =>
                            !githubCollaborators.some(githubCollab => githubCollab.login === invitedLogin)
                          );
                          if (nonGithubInvited.length === 0) return null;

                          return (
                            <>
                              <h3 className="text-xl font-semibold text-white mb-4 mt-6 border-b border-white/10 pb-2">
                                Other Invited Collaborators ({nonGithubInvited.length})
                              </h3>
                              <div className="grid grid-cols-1 divide-y divide-white/10">
                                {nonGithubInvited.map((githubUsername, index) => (
                                  <motion.div
                                    key={githubUsername || `invited-${index}`}
                                    variants={itemVariants}
                                    custom={index}
                                    className="py-4 first:pt-0 last:pb-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center overflow-hidden">
                                          <Github className="text-white h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                          <h4 className="text-white font-medium">
                                            {githubUsername}
                                          </h4>
                                          <p className="text-daoship-text-gray text-sm">
                                            GitHub Username (Pending Acceptance)
                                          </p>
                                        </div>
                                      </div>
                                      <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                        Pending Invitation
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </motion.div>
                </GlassmorphicCard>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  DAO Settings
                </h2>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-6"
                >
                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <h3 className="text-xl font-medium text-white mb-4">
                        General Information
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            DAO Name
                          </label>
                          <input
                            type="text"
                            value={dao.name}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Description
                          </label>
                          <textarea
                            value={dao.description}
                            disabled
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Creation Date
                          </label>
                          <input
                            type="text"
                            value={formatDate(dao.createdAt)}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Contract Address
                          </label>
                          <input
                            type="text"
                            value={dao.contractAddress}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        {dao.githubRepo && (
                          <div>
                            <label className="block text-daoship-text-gray text-sm mb-1">
                              GitHub Repository
                            </label>
                            <a
                              href={dao.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-daoship-primary flex items-center hover:underline"
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              {dao.githubRepo}
                            </a>
                          </div>
                        )}
                      </div>
                    </GlassmorphicCard>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <h3 className="text-xl font-medium text-white mb-4">
                        Token Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Token Name
                          </label>
                          <input
                            type="text"
                            value={dao.tokenName}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Token Symbol
                          </label>
                          <input
                            type="text"
                            value={dao.tokenSymbol}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Token Supply ({dao.tokenStrategy} Strategy)
                          </label>
                          <input
                            type="text"
                            value={dao.tokenSupply.toLocaleString()}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Vote Price
                          </label>
                          <input
                            type="number"
                            value={dao.votePrice}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Min. Tokens to Participate
                          </label>
                          <input
                            type="number"
                            value={dao.minTokens}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Min. Contribution for Voting
                          </label>
                          <input
                            type="number"
                            value={dao.minContributionForVoting}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Vesting Period (days)
                          </label>
                          <input
                            type="number"
                            value={dao.vestingPeriod}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                      </div>
                      {dao.tokenStrategy === 'fixed' && (
                        <div className="mt-6">
                          <h4 className="text-white font-medium mb-2">Token Allocation:</h4>
                          <ul className="text-daoship-text-gray text-sm space-y-1">
                            <li>Initial Distribution: {dao.tokenAllocation.initialDistribution}%</li>
                            <li>Future Contributors: {dao.tokenAllocation.futureContributors}%</li>
                            <li>DAO Treasury: {dao.tokenAllocation.treasury}%</li>
                          </ul>
                        </div>
                      )}
                      <div className="mt-6">
                        <h4 className="text-white font-medium mb-2">Contribution Rewards:</h4>
                        <ul className="text-daoship-text-gray text-sm space-y-1">
                          <li>New PR: {dao.contributionRewards.newPR} tokens</li>
                          <li>Accepted PR: {dao.contributionRewards.acceptedPR} tokens</li>
                          <li>Issue Creation: {dao.contributionRewards.issueCreation} tokens</li>
                          <li>Code Review: {dao.contributionRewards.codeReview} tokens</li>
                        </ul>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <h3 className="text-xl font-medium text-white mb-4">
                        Governance Parameters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Voting Period (days)
                          </label>
                          <input
                            type="number"
                            value={dao.votingPeriod}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-daoship-text-gray text-sm mb-1">
                            Quorum (%)
                          </label>
                          <input
                            type="number"
                            value={dao.quorum}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-daoship-primary/80 hover:bg-daoship-primary rounded-lg text-white flex items-center justify-center disabled:opacity-50"
                          disabled={!isDAOAdmin}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Parameters
                        </motion.button>
                        <p className="text-xs text-daoship-text-gray mt-2">
                          * Only DAO creator or manager can edit these parameters
                        </p>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <GlassmorphicCard className="p-6">
                      <h3 className="text-xl font-medium text-white mb-4">
                        Advanced Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <h4 className="text-white font-medium">
                              Export DAO Data
                            </h4>
                            <p className="text-daoship-text-gray text-sm">
                              Download all DAO data in JSON format
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
                            disabled={!isDAOAdmin}
                          >
                            Export
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <h4 className="text-white font-medium">
                              Transfer Ownership
                            </h4>
                            <p className="text-daoship-text-gray text-sm">
                              Transfer DAO ownership to another address
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
                            disabled={!isDAOAdmin}
                          >
                            Transfer
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div>
                            <h4 className="text-white font-medium">
                              Danger Zone
                            </h4>
                            <p className="text-daoship-text-gray text-sm">
                              Dissolve this DAO (irreversible action)
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm"
                            disabled={!isDAOAdmin}
                          >
                            Dissolve
                          </motion.button>
                        </div>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DAODashboard;