const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  daoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DAO',
    required: true
  },
  githubUsername: {
    type: String,
    required: true
  },
  invitedBy: {
    type: String, // Wallet address of the person who sent the invitation
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  // Additional metadata from GitHub
  githubData: {
    id: Number,
    avatar_url: String,
    name: String,
    email: String,
    bio: String,
    company: String,
    location: String
  },
  // Token allocation info (if needed)
  tokenAllocation: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one invitation per DAO per GitHub user
invitationSchema.index({ daoId: 1, githubUsername: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);