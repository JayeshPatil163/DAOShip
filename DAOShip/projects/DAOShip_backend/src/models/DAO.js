const mongoose = require('mongoose');

const daoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: String, // Wallet address
    required: true
  },
  manager: {
    type: String, // Wallet address
    required: true
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true
  },
  votePrice: {
    type: Number,
    required: true,
    min: 0
  },
  tokenName: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  tokenSupply: {
    type: Number,
    required: true,
    min: 1
  },
  votingPeriod: {
    type: Number,
    required: true,
    min: 1
  },
  quorum: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  minTokens: {
    type: Number,
    required: true,
    min: 0
  },
  githubRepo: {
    type: String,
    trim: true
  },
  tokenStrategy: {
    type: String,
    enum: ['fixed', 'dynamic', 'hybrid'], // Define your token strategies
    required: true
  },
  initialDistribution: {
    type: mongoose.Schema.Types.Mixed, // Can be object or array depending on your needs
    default: {}
  },
  tokenAllocation: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  contributionRewards: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  vestingPeriod: {
    type: Number,
    min: 0,
    default: 0
  },
  minContributionForVoting: {
    type: Number,
    min: 0,
    default: 0
  },
  invitedCollaborators: [{
    type: String, // Assuming these are wallet addresses or usernames
    trim: true
  }],
  members: [{
    type: String, // Wallet addresses
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
daoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
daoSchema.index({ creator: 1 });
daoSchema.index({ manager: 1 });
daoSchema.index({ contractAddress: 1 });
daoSchema.index({ name: 1 });

module.exports = mongoose.model('DAO', daoSchema);