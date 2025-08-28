import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GlassmorphicInput from "@/components/ui/glassmorphic-input";
import GlassmorphicTextarea from "@/components/ui/glassmorphic-textarea";
import GlassmorphicSlider from "@/components/ui/glassmorphic-slider";
import GradientButton from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Users, UserPlus, CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios"; // Make sure axios is installed
import { useWallet } from "@/hooks/use-wallet";

const steps = [
  "Basic Information",
  "Governance Parameters",
  "Token Configuration",
  "Invite Collaborators",
  "Review & Submit",
];

const API_URL = "http://localhost:3000/api";

interface ValidationErrors {
  name?: string;
  description?: string;
  votingPeriod?: string;
  quorum?: string;
  minTokens?: string;
  tokenName?: string;
  tokenSymbol?: string;
  githubRepo?: string;
  tokenSupply?: string;
  tokenAllocation?: string;
  vestingPeriod?: string;
  minContributionForVoting?: string;
}

const CreateDAO = () => {
  const { isConnected, walletAddress, connect } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);
  const [collaboratorsError, setCollaboratorsError] = useState(null);
  const [invitingCollaborators, setInvitingCollaborators] = useState([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: 1000000,
    votingPeriod: 7,
    quorum: 50,
    minTokens: 100,
    logo: null,
    logoPreview: "",
    votePrice: 1,
    repolink: "",
    invitedCollaborators: [], // This will store GitHub IDs
    // New GitHub-specific fields
    githubRepo: "",
    tokenStrategy: "fixed", // 'fixed', 'dynamic', or 'hybrid'
    initialDistribution: {
      commits: 10,
      pullRequests: 50,
      issues: 20,
      codeReviews: 15,
    },
    tokenAllocation: {
      initialDistribution: 60, // percentage of total tokens for initial distribution
      futureContributors: 30, // percentage reserved for future contributors
      treasury: 10, // percentage for DAO treasury
    },
    contributionRewards: {
      newPR: 30,
      acceptedPR: 50,
      issueCreation: 20,
      codeReview: 15,
    },
    vestingPeriod: 30,
    minContributionForVoting: 100,
  });

  // Validation functions for each step
  const validateStep = (stepIndex) => {
    const errors: { name?: string; description?: string; votingPeriod?: string; quorum?: string; minTokens?: string; tokenName?: string; tokenSymbol?: string; githubRepo?: string } = {};

    switch (stepIndex) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          errors.name = "DAO name is required";
        }
        if (!formData.description.trim()) {
          errors.description = "Description is required";
        }
        break;

      case 1: // Governance Parameters
        if (formData.votingPeriod < 1 || formData.votingPeriod > 30) {
          errors.votingPeriod = "Voting period must be between 1 and 30 days";
        }
        if (formData.quorum < 1 || formData.quorum > 100) {
          errors.quorum = "Quorum must be between 1 and 100%";
        }
        if (formData.minTokens < 0) {
          errors.minTokens = "Minimum tokens cannot be negative";
        }
        break;

      case 2: // Token Configuration
        if (!formData.tokenName.trim()) {
          errors.tokenName = "Token name is required";
        }
        if (!formData.tokenSymbol.trim()) {
          errors.tokenSymbol = "Token symbol is required";
        }
        if (formData.tokenSymbol.length > 5) {
          errors.tokenSymbol = "Token symbol must be 5 characters or less";
        }
        if (!formData.githubRepo.trim()) {
          errors.githubRepo = "GitHub repository URL is required";
        } else {
          // Basic URL validation
          try {
            const url = new URL(formData.githubRepo);
            if (url.hostname !== 'github.com') {
              errors.githubRepo = 'Must be a valid GitHub repository URL';
            }
          } catch (e) {
            errors.githubRepo = 'Invalid URL format';
          }
        }
        if (formData.tokenStrategy === "fixed" && formData.tokenSupply <= 0) {
          errors.tokenSupply = "Token supply must be greater than 0";
        }
        // Validate token allocation adds up to 100%
        if (formData.tokenStrategy === "fixed") {
          const totalAllocation = formData.tokenAllocation.initialDistribution +
            formData.tokenAllocation.futureContributors +
            formData.tokenAllocation.treasury;
          if (totalAllocation !== 100) {
            errors.tokenAllocation = "Token allocation must add up to 100%";
          }
        }
        if (formData.vestingPeriod < 0) {
          errors.vestingPeriod = "Vesting period cannot be negative";
        }
        if (formData.minContributionForVoting < 0) {
          errors.minContributionForVoting = "Minimum contribution for voting cannot be negative";
        }
        break;

      case 3: // Invite Collaborators (optional step, no required validation)
        // If githubRepo is provided but no collaborators fetched or an error occurred,
        // we might want to warn the user, but not prevent them from proceeding.
        if (formData.githubRepo && collaborators.length === 0 && !collaboratorsLoading && collaboratorsError) {
          // This is more of a warning than an error that prevents progression
          // errors.collaborators = collaboratorsError;
        }
        break;

      case 4: // Review & Submit (no additional validation needed)
        break;

      default:
        break;
    }

    return errors;
  };

  // Handle text input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: undefined });
    }
  };

  const parseGitHubUrl = (url) => {
    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(regex);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '') // Remove .git if present
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  };

  const fetchCollaborators = async () => {
    if (!formData.githubRepo) {
      setCollaboratorsError('GitHub repository URL is required to fetch collaborators');
      return;
    }

    const repoInfo = parseGitHubUrl(formData.githubRepo);
    if (!repoInfo) {
      setCollaboratorsError('Invalid GitHub repository URL format');
      return;
    }

    setCollaboratorsLoading(true);
    setCollaboratorsError(null);

    try {
      // Replace 'YOUR_GITHUB_TOKEN' with your actual GitHub token
      // In a real application, you would handle this securely, e.g., through a backend proxy
      // or OAuth flow, not directly in the frontend like this.
      // Use process.env.VITE_GITHUB_TOKEN or import.meta.env.VITE_GITHUB_TOKEN
      // assuming you have it set up in your build environment.
      // For this example, I'm keeping the placeholder as provided.
      const GITHUB_TOKEN = "Add_YOUR_GITHUB_TOKEN_HERE"; // This token needs to be valid and stored securely

      if (!GITHUB_TOKEN) {
        throw new Error("GitHub API token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.");
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/collaborators`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or you don\'t have access. Please ensure the URL is correct and the repository is public or you have sufficient permissions.');
        } else if (response.status === 401) {
          throw new Error('Invalid GitHub token or insufficient permissions. Please check your token.');
        } else if (response.status === 403) {
          const rateLimitReset = response.headers.get('X-RateLimit-Reset');
          const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown';
          throw new Error(`GitHub API rate limit exceeded or forbidden. Please wait until ${resetTime} and try again.`);
        } else {
          throw new Error(`Failed to fetch collaborators: ${response.statusText}`);
        }
      }

      const collaboratorsData = await response.json();

      // Fetch additional user details for each collaborator
      const collaboratorsWithDetails = await Promise.all(
        collaboratorsData.map(async (collaborator) => {
          try {
            const userResponse = await fetch(collaborator.url, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                ...collaborator,
                name: userData.name,
                email: userData.email,
                bio: userData.bio,
                company: userData.company,
                location: userData.location,
              };
            }
            return collaborator;
          } catch (error) {
            console.error(`Error fetching details for ${collaborator.login}:`, error);
            return collaborator;
          }
        })
      );

      setCollaborators(collaboratorsWithDetails);
      if (collaboratorsWithDetails.length === 0) {
        setCollaboratorsError('No collaborators found for this repository.');
      }

    } catch (error) {
      console.error('Error fetching collaborators:', error);
      setCollaboratorsError(error.message);
    } finally {
      setCollaboratorsLoading(false);
    }
  };

  // Function to handle collaborator invitation
  const handleInviteCollaborator = async (collaborator) => {
    setInvitingCollaborators(prev => [...prev, collaborator.id]);

    try {
      // Store the GitHub login (username) or id in invitedCollaborators
      // Using login (username) might be more human-readable in the backend/DB
      // If you need unique numeric ID, use collaborator.id
      const collaboratorIdentifier = collaborator.login; // Or collaborator.id if you prefer numeric ID

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFormData(prev => ({
        ...prev,
        invitedCollaborators: [...(prev.invitedCollaborators || []), collaboratorIdentifier]
      }));

      console.log(`Invitation sent to ${collaborator.login}`);

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${collaborator.login}`,
      });

    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInvitingCollaborators(prev => prev.filter(id => id !== collaborator.id));
    }
  };

  // Auto-fetch collaborators when reaching step 3 (Invite Collaborators is now step 3)
  useEffect(() => {
    if (currentStep === 3 && formData.githubRepo && collaborators.length === 0 && !collaboratorsLoading && !collaboratorsError) {
      fetchCollaborators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData.githubRepo, collaborators.length, collaboratorsLoading, collaboratorsError]);

  // Optional: Clear collaborators and errors when GitHub repo changes
  useEffect(() => {
    setCollaborators([]);
    setCollaboratorsError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.githubRepo]);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setFormData({
            ...formData,
            logo: file,
            logoPreview: event.target.result,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Create a new DAO using the API
  const createDAO = async (daoData) => {
    try {
      const response = await axios.post(`${API_URL}/dao`, daoData);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation for the last step
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    // Only show wallet connection message if not connected
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet using the button in the navigation bar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data to send to your backend API
      const daoData = {
        name: formData.name,
        description: formData.description,
        creator: walletAddress, // Assign the creator's wallet address
        manager: walletAddress, // Manager defaults to creator for now
        // You'll need to generate contractAddress on the backend or during deployment
        // For now, let's set a placeholder or omit if backend handles it
        contractAddress: "0xPlaceholderContractAddress", // Replace with actual contract address
        votePrice: formData.votePrice,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        tokenSupply: formData.tokenSupply,
        votingPeriod: formData.votingPeriod,
        quorum: formData.quorum,
        minTokens: formData.minTokens,
        githubRepo: formData.githubRepo,
        tokenStrategy: formData.tokenStrategy,
        initialDistribution: formData.initialDistribution,
        tokenAllocation: formData.tokenAllocation,
        contributionRewards: formData.contributionRewards,
        vestingPeriod: formData.vestingPeriod,
        minContributionForVoting: formData.minContributionForVoting,
        invitedCollaborators: formData.invitedCollaborators, // GitHub IDs/usernames
        members: [walletAddress], // Creator is the first member by default
      };

      const response = await axios.post(`${API_URL}/dao`, daoData);

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(response.data.message || "Failed to create DAO");
      }

      const dao = response.data;
      toast({
        title: "Success",
        description: "DAO created successfully!",
      });
      navigate(`/dao/${dao._id}`);
    } catch (error) {
      console.error("Error creating DAO:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create DAO. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go to next step with validation
  const nextStep = () => {
    const errors = validateStep(currentStep);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // Show toast with first error
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setValidationErrors({});

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({}); // Clear validation errors when going back
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <>
            <div className="space-y-6">
              <div>
                <GlassmorphicInput
                  label="DAO Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <GlassmorphicTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your DAO's purpose and goals..."
                  required
                />
                {validationErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-white/70 mb-2">Logo (Optional)</p>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden glass-card flex items-center justify-center">
                    {formData.logoPreview ? (
                      <img
                        src={formData.logoPreview}
                        alt="DAO Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-white/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label htmlFor="logo" className="cursor-pointer w-full">
                      <GradientButton
                        type="button"
                        variant="secondary"
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.logo ? "Change Logo" : "Upload Logo"}
                      </GradientButton>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 1: // Governance Parameters
        return (
          <div className="space-y-6">
            <div>
              <GlassmorphicSlider
                label="Voting Period (Days)"
                min={1}
                max={30}
                value={formData.votingPeriod}
                onChange={(value) =>
                  setFormData({ ...formData, votingPeriod: value })
                }
                unit=" days"
              />
              {validationErrors.votingPeriod && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.votingPeriod}</p>
              )}
            </div>

            <div>
              <GlassmorphicSlider
                label="Quorum Percentage"
                min={1}
                max={100}
                value={formData.quorum}
                onChange={(value) => setFormData({ ...formData, quorum: value })}
                unit="%"
              />
              {validationErrors.quorum && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.quorum}</p>
              )}
            </div>

            <div>
              <GlassmorphicInput
                label="Minimum Tokens to Participate"
                name="minTokens"
                type="number"
                value={formData.minTokens.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minTokens: parseInt(e.target.value) || 0,
                  })
                }
              />
              {validationErrors.minTokens && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.minTokens}</p>
              )}
            </div>

            <div className="p-4 glass-card rounded-lg mt-6">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Tip:</span> A
                higher quorum percentage ensures more community participation,
                but may make it harder to pass proposals.
              </p>
            </div>
          </div>
        );

      case 2: // Token Configuration
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <GlassmorphicInput
                  label="Token Name"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleChange}
                  required
                />
                {validationErrors.tokenName && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.tokenName}</p>
                )}
              </div>

              <div>
                <GlassmorphicInput
                  label="Token Symbol"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange}
                  maxLength={5}
                  required
                />
                {validationErrors.tokenSymbol && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.tokenSymbol}</p>
                )}
              </div>
            </div>

            <div>
              <GlassmorphicInput
                label="GitHub Repository URL"
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                required
              />
              {validationErrors.githubRepo && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.githubRepo}</p>
              )}
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Token Supply Strategy</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tokenStrategy"
                      value="fixed"
                      checked={formData.tokenStrategy === "fixed"}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenStrategy: e.target.value
                      })}
                      className="form-radio text-daoship-blue"
                    />
                    <span className="text-white">Fixed Supply</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tokenStrategy"
                      value="dynamic"
                      checked={formData.tokenStrategy === "dynamic"}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenStrategy: e.target.value
                      })}
                      className="form-radio text-daoship-blue"
                    />
                    <span className="text-white">Dynamic Supply</span>
                  </label>
                </div>

                {formData.tokenStrategy === "fixed" ? (
                  <div className="space-y-4">
                    <div>
                      <GlassmorphicInput
                        label="Total Token Supply"
                        name="tokenSupply"
                        type="number"
                        value={formData.tokenSupply}
                        onChange={(e) => setFormData({
                          ...formData,
                          tokenSupply: parseInt(e.target.value) || 0
                        })}
                        required
                      />
                      {validationErrors.tokenSupply && (
                        <p className="text-red-400 text-sm mt-1">{validationErrors.tokenSupply}</p>
                      )}
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <h5 className="text-white font-medium mb-2">Token Allocation</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-white/70">Initial Distribution ({formData.tokenAllocation.initialDistribution}%)</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.initialDistribution}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                initialDistribution: value
                              }
                            })}
                            unit="%" label={""} />
                        </div>
                        <div>
                          <label className="text-sm text-white/70">Future Contributors ({formData.tokenAllocation.futureContributors}%)</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.futureContributors}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                futureContributors: value
                              }
                            })}
                            unit="%" label={""} />
                        </div>
                        <div>
                          <label className="text-sm text-white/70">DAO Treasury ({formData.tokenAllocation.treasury}%)</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.treasury}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                treasury: value
                              }
                            })}
                            unit="%" label={""} />
                        </div>
                      </div>
                      {validationErrors.tokenAllocation && (
                        <p className="text-red-400 text-sm mt-2">{validationErrors.tokenAllocation}</p>
                      )}
                      <div className="mt-2 text-sm text-white/60">
                        Total: {formData.tokenAllocation.initialDistribution + formData.tokenAllocation.futureContributors + formData.tokenAllocation.treasury}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/70">
                      With dynamic supply, tokens will be minted for new contributions based on the reward rates below.
                      This allows for unlimited growth but requires careful management of inflation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Initial Token Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicInput
                  label="Tokens per Commit"
                  name="initialDistribution.commits"
                  type="number"
                  value={formData.initialDistribution.commits}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      commits: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per PR"
                  name="initialDistribution.pullRequests"
                  type="number"
                  value={formData.initialDistribution.pullRequests}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      pullRequests: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per Issue"
                  name="initialDistribution.issues"
                  type="number"
                  value={formData.initialDistribution.issues}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      issues: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per Code Review"
                  name="initialDistribution.codeReviews"
                  type="number"
                  value={formData.initialDistribution.codeReviews}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      codeReviews: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Ongoing Contribution Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicInput
                  label="New PR Reward"
                  name="contributionRewards.newPR"
                  type="number"
                  value={formData.contributionRewards.newPR}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      newPR: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Accepted PR Reward"
                  name="contributionRewards.acceptedPR"
                  type="number"
                  value={formData.contributionRewards.acceptedPR}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      acceptedPR: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Issue Creation Reward"
                  name="contributionRewards.issueCreation"
                  type="number"
                  value={formData.contributionRewards.issueCreation}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      issueCreation: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Code Review Reward"
                  name="contributionRewards.codeReview"
                  type="number"
                  value={formData.contributionRewards.codeReview}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      codeReview: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Voting Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <GlassmorphicInput
                    label="Vesting Period (days)"
                    name="vestingPeriod"
                    type="number"
                    value={formData.vestingPeriod}
                    onChange={(e) => setFormData({
                      ...formData,
                      vestingPeriod: parseInt(e.target.value) || 0
                    })}
                  />
                  {validationErrors.vestingPeriod && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.vestingPeriod}</p>
                  )}
                </div>
                <div>
                  <GlassmorphicInput
                    label="Minimum Tokens for Voting"
                    name="minContributionForVoting"
                    type="number"
                    value={formData.minContributionForVoting}
                    onChange={(e) => setFormData({
                      ...formData,
                      minContributionForVoting: parseInt(e.target.value) || 0
                    })}
                  />
                  {validationErrors.minContributionForVoting && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.minContributionForVoting}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg mt-6">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Note:</span>{" "}
                Tokens will be distributed based on GitHub contributions. New contributors will need to complete the vesting period before they can vote.
              </p>
            </div>
          </div>
        );

      case 3: // Invite Collaborators (This is now case 3 as per the updated steps array)
        return (
          <div className="space-y-6">
            <GlassmorphicCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Repository Collaborators
                </h3>
                <GradientButton
                  type="button"
                  variant="secondary"
                  onClick={fetchCollaborators}
                  disabled={collaboratorsLoading || !formData.githubRepo}
                  className="flex items-center space-x-2"
                >
                  {collaboratorsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </>
                  )}
                </GradientButton>
              </div>

              {collaboratorsError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                  <p className="text-red-400 text-sm">{collaboratorsError}</p>
                </div>
              )}

              {collaborators.length === 0 && !collaboratorsLoading && !collaboratorsError && formData.githubRepo && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No collaborators found for the provided repository or click "Refresh" to fetch them.</p>
                  <p className="text-sm text-white/40 mt-2">
                    Ensure the repository is public or your GitHub token has the necessary permissions.
                  </p>
                </div>
              )}

              {collaborators.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-white/70 mb-4">
                    Found {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''} for your repository.
                    Send invitations to include them in your DAO.
                  </p>

                  <div className="grid gap-4">
                    {collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-4 glass-card rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={collaborator.avatar_url}
                            alt={`${collaborator.login}'s avatar`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="text-white font-medium">{collaborator.login}</h4>
                            {collaborator.name && (
                              <p className="text-sm text-white/60">{collaborator.name}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/70">
                                {collaborator.role || collaborator.permissions?.admin ? 'Admin' :
                                  collaborator.permissions?.maintain ? 'Maintainer' :
                                    collaborator.permissions?.push ? 'Write' : 'Read'}
                              </span>
                              {collaborator.site_admin && (
                                <span className="text-xs px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-400">
                                  Site Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Check if collaborator's login is in invitedCollaborators */}
                          {formData.invitedCollaborators?.includes(collaborator.login) ? (
                            <span className="text-sm text-daoship-mint font-medium flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Invited
                            </span>
                          ) : (
                            <GradientButton
                              type="button"
                              onClick={() => handleInviteCollaborator(collaborator)}
                              disabled={invitingCollaborators.includes(collaborator.id)} // Still track inviting by ID
                              className="flex items-center space-x-2"
                            >
                              {invitingCollaborators.includes(collaborator.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Inviting...</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4" />
                                  <span>Invite</span>
                                </>
                              )}
                            </GradientButton>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassmorphicCard>

            <div className="p-4 glass-card rounded-lg">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Info:</span>{" "}
                Invited collaborators will receive an email notification with instructions to claim their DAO tokens.
                They can accept the invitation and participate in governance once the DAO is deployed.
              </p>
            </div>
          </div>
        );

      case 4: // Review & Submit
        return (
          <div className="space-y-6">
            <GlassmorphicCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Review DAO Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-white/60">DAO Name</p>
                    <p className="text-white">
                      {formData.name || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Token</p>
                    <p className="text-white">
                      {formData.tokenName} ({formData.tokenSymbol})
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Token Supply</p>
                    <p className="text-white">
                      {formData.tokenStrategy === "fixed" ? formData.tokenSupply.toLocaleString() : "Dynamic"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Voting Period</p>
                    <p className="text-white">{formData.votingPeriod} days</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Quorum</p>
                    <p className="text-white">{formData.quorum}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Minimum Tokens</p>
                    <p className="text-white">
                      {formData.minTokens.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">GitHub Repository</p>
                    <p className="text-white">
                      {formData.githubRepo || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Vesting Period</p>
                    <p className="text-white">
                      {formData.vestingPeriod} days
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Min. Tokens for Voting</p>
                    <p className="text-white">
                      {formData.minContributionForVoting.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white/60">Description</p>
                  <p className="text-white">
                    {formData.description || "No description provided"}
                  </p>
                </div>

                {formData.logoPreview && (
                  <div>
                    <p className="text-sm text-white/60">Logo</p>
                    <img
                      src={formData.logoPreview}
                      alt="DAO Logo"
                      className="w-16 h-16 rounded-lg mt-2 object-cover"
                    />
                  </div>
                )}

                {formData.invitedCollaborators && formData.invitedCollaborators.length > 0 && (
                  <div>
                    <p className="text-sm text-white/60">Invited Collaborators</p>
                    <p className="text-white">
                      {formData.invitedCollaborators.length} collaborator{formData.invitedCollaborators.length !== 1 ? 's' : ''} invited (GitHub usernames)
                    </p>
                  </div>
                )}
              </div>
            </GlassmorphicCard>

            <div className="p-4 glass-card rounded-lg mt-2">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-mint font-medium">
                  Ready to launch!
                </span>{" "}
                By submitting, you'll deploy this DAO to the Algorand
                blockchain. This action is irreversible.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-text">
            Create Your DAO
          </h1>

          {/* Steps Progress */}
          <div className="mb-10">
            <div className="flex justify-between relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-gradient-primary"
                        : "bg-white/10"
                    }`}
                  >
                    <span className="text-white font-medium">{index + 1}</span>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      index <= currentStep ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}

              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 -translate-y-1/2 bg-white/10">
                <div
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <GlassmorphicCard className="p-8" glowEffect>
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              <div className="flex justify-between mt-10">
                <GradientButton
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  Back
                </GradientButton>

                {currentStep < steps.length - 1 ? (
                  <GradientButton type="button" onClick={nextStep}>
                    Continue
                  </GradientButton>
                ) : (
                  <GradientButton
                    type="submit"
                    disabled={isSubmitting}
                    variant="success"
                    glowEffect
                  >
                    {isSubmitting ? "Creating DAO..." : "Create DAO"}
                  </GradientButton>
                )}
              </div>
            </form>
          </GlassmorphicCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateDAO;