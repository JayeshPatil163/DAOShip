const express = require("express");
const router = express.Router();
const DAO = require("../models/DAO");
const Proposal = require("../models/Proposal");
const { deployDAOContract } = require("../services/algorand.service");

// Create a new DAO
// router.post("/", async (req, res) => {
//   try {
//     const { name, description, creator, votingPeriod, quorum } = req.body;

//     // Deploy DAO contract using AlgoKit
//     const contractAddress = await deployDAOContract({
//       name,
//       votingPeriod,
//       quorum,
//     });
//     // const contractAddress = "dummy-algo-address";

//     console.log("Received DAO create request with:", req.body);


//     const dao = new DAO({
//       name,
//       description,
//       creator,
//       contractAddress,
//       votingPeriod,
//       quorum,
//       members: [creator],
//     });

//     await dao.save();
//     res.status(201).json(dao);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


router.post("/", async (req, res) => {
  try {
    const { 
      name, 
      description, 
      manager, // Changed from 'creator' to 'manager'
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      votingPeriod, 
      quorum,
      minTokens,
      githubRepo,
      tokenStrategy,
      initialDistribution,
      tokenAllocation,
      contributionRewards,
      vestingPeriod,
      minContributionForVoting,
      invitedCollaborators
    } = req.body;

    console.log("Creating DAO with parameters:", {
      name,
      description,
      manager,
      votePrice});
    // Deploy DAO contract using AlgoKit
    const contractAddress = await deployDAOContract({
      name,
      votingPeriod,
      quorum,
      // You might want to pass additional contract parameters here
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      minTokens
    });
    // const contractAddress = "dummy-algo-address";

    console.log("Received DAO create request with:", req.body);

    const dao = new DAO({
      name,
      description,
      creator: manager, // Map manager to creator if your DAO model uses 'creator'
      manager, // Add manager field if your model supports it
      contractAddress,
      votePrice,
      tokenName,
      tokenSymbol,
      tokenSupply,
      votingPeriod,
      quorum,
      minTokens,
      githubRepo,
      tokenStrategy,
      initialDistribution,
      tokenAllocation,
      contributionRewards,
      vestingPeriod,
      minContributionForVoting,
      invitedCollaborators: invitedCollaborators || [], // Handle array of collaborators
      members: [manager], // Initialize with manager as first member
      // Add invited collaborators to members if they should be auto-added
      // members: [manager, ...(invitedCollaborators || [])],
    });

    await dao.save();
    res.status(201).json(dao);
  } catch (error) {
    console.error("Error creating DAO:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all DAOs
router.get("/", async (req, res) => {
  try {
    const daos = await DAO.find().populate("creator", "username walletAddress");
    res.json(daos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific DAO
router.get("/:id", async (req, res) => {
  console.log("Fetching DAO with ID:", req.params.id);
  try {
    const dao = await DAO.findById(req.params.id)
      .populate("creator", "username walletAddress")
      .populate("members", "username walletAddress");
    if (!dao) {
      return res.status(404).json({ message: "DAO not found" });
    }
    res.json(dao);
    console.log("Fetched DAO:", dao);
  } catch (error) {
    console.error("Error fetching DAO:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add the new route that matches the frontend API call pattern
router.post("/:daoId/proposals", async (req, res) => {
  try {
    const { daoId } = req.params;
    const { title, description, creator, startTime, endTime } = req.body;

    // Create proposal on Algorand
    // const proposalId = await createProposal({
    //   dao: daoId,
    //   title,
    //   description,
    //   startTime,
    //   endTime,
    // });

    // Option 1: Generate a temporary proposalId (until Algorand implementation is ready)
    const proposalId = `proposal-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    const proposal = new Proposal({
      title,
      description,
      dao: daoId,
      creator,
      startTime,
      endTime,
      proposalId,
    });

    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// In your dao.routes.js

// Get all proposals for a specific DAO
router.get("/:id/proposals", async (req, res) => {
  console.log("Fetching proposals for DAO ID:", req.params.id);
  try {
    const daoId = req.params.id;
    console.log(`Fetching proposals for DAO ID: ${daoId}`); 
    const proposals = await Proposal.find({ dao: daoId })
      .populate("creator", "username walletAddress")
      .sort({ createdAt: -1 });

    if (!proposals) {
      return res.status(404).json({ message: "No proposals found for this DAO" });
    }

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: error.message });
  }
});


// Join a DAO
router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const dao = await DAO.findById(req.params.id);

    if (!dao) {
      return res.status(404).json({ message: "DAO not found" });
    }

    if (dao.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    dao.members.push(userId);
    await dao.save();
    res.json(dao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
