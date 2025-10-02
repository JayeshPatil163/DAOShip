const express = require("express");
const router = express.Router();
const Invitation = require("../models/Invitation");
const DAO = require("../models/DAO");

// Get all invitations (admin endpoint)
router.get("/", async (req, res) => {
  try {
    const { status, daoId, githubUsername } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (daoId) filter.daoId = daoId;
    if (githubUsername) filter.githubUsername = githubUsername;

    const invitations = await Invitation.find(filter)
      .populate("daoId", "name description creator")
      .sort({ invitedAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get invitations for a specific GitHub username
router.get("/github/:username", async (req, res) => {
  try {
    const username = req.params.username;
    console.log(`Looking for invitations for GitHub username: "${username}"`);

    // Make search case-insensitive using regex
    const invitations = await Invitation.find({
      githubUsername: { $regex: new RegExp(`^${username}$`, "i") },
    })
      .populate("daoId", "name description creator tokenName tokenSymbol")
      .sort({ invitedAt: -1 });

    console.log(`Found ${invitations.length} invitations for "${username}"`);

    res.json(invitations);
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    res.status(500).json({ message: error.message });
  }
});

// Accept or decline an invitation
router.patch("/:invitationId", async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status, walletAddress } = req.body; // status: 'accepted' | 'declined'

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'declined'" });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation has already been responded to" });
    }

    invitation.status = status;
    invitation.respondedAt = new Date();
    await invitation.save();

    // If accepted, add the user to the DAO members
    if (status === "accepted" && walletAddress) {
      const dao = await DAO.findById(invitation.daoId);
      if (dao) {
        // Normalize existing members to the new format
        const normalizedMembers = dao.members.map((member) => {
          if (typeof member === "string") {
            return { walletAddress: member };
          } else if (member && typeof member === "object") {
            if (member.walletAddress) {
              return member;
            } else {
              // Handle the weird object format from MongoDB (string stored as object with numeric keys)
              const keys = Object.keys(member)
                .filter((key) => !isNaN(key))
                .sort((a, b) => parseInt(a) - parseInt(b));
              const walletAddr = keys.map((key) => member[key]).join("");
              return { walletAddress: walletAddr };
            }
          }
          return member;
        });

        // Check if the wallet address is already a member
        const existingMember = normalizedMembers.find((member) => member.walletAddress === walletAddress);

        if (!existingMember) {
          // Add member with username from invitation
          normalizedMembers.push({
            username: invitation.githubUsername,
            walletAddress: walletAddress,
          });

          // Update the DAO with normalized members
          dao.members = normalizedMembers;
          await dao.save();
        }
      }
    }

    // Return the updated invitation with DAO details
    const updatedInvitation = await Invitation.findById(invitationId).populate(
      "daoId",
      "name description creator tokenName tokenSymbol",
    );

    res.json(updatedInvitation);
  } catch (error) {
    console.error("Error updating invitation:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete/cancel an invitation (only by the inviter or admin)
router.delete("/:invitationId", async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { invitedBy } = req.body; // Wallet address of the person canceling

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Only allow the original inviter to cancel (in a real app, you'd want proper auth)
    if (invitation.invitedBy !== invitedBy) {
      return res.status(403).json({ message: "Not authorized to cancel this invitation" });
    }

    await Invitation.findByIdAndDelete(invitationId);
    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk operations for invitations
router.post("/bulk", async (req, res) => {
  try {
    const { action, invitationIds, data } = req.body;

    if (action === "expire") {
      // Mark multiple invitations as expired
      await Invitation.updateMany(
        { _id: { $in: invitationIds }, status: "pending" },
        { status: "expired", respondedAt: new Date() },
      );
      res.json({ message: `${invitationIds.length} invitations marked as expired` });
    } else {
      res.status(400).json({ message: "Invalid bulk action" });
    }
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;