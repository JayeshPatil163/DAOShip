const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    // required: true,
  },
  proposalId: {
    type: String,
    // required: true,
  },
  dao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DAO",
    // required: true,
  },
  contractAddress: {
    type: String,
    // required: true,
  },
  creator: {
    type: String,
    ref: "User",
    // required: true,
  },
  status: {
    type: String,
    enum: ["active", "passed", "failed", "executed"],
    default: "active",
  },
  startTime: {
    type: Date,
    // required: true,
  },
  endTime: {
    type: Date,
    // required: true,
  },
  votes: [
    {
      voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      walletAddress: {
        type: String,
        required: true,
      },
      githubUsername: {
        type: String,
        required: true,
      },
      vote: {
        type: String,
        enum: ["yes", "no", "abstain"],
        required: true,
      },
      votingPower: {
        type: Number,
        default: 1,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  yesVotes: {
    type: Number,
    default: 0,
  },
  noVotes: {
    type: Number,
    default: 0,
  },
  abstainVotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Proposal", proposalSchema);
