// Test script to check all invitations and their statuses
const API_URL = "http://localhost:3000/api";

async function checkAllInvitations() {
  try {
    console.log("Checking all invitations...");
    const response = await fetch(`${API_URL}/invitations`);
    const invitations = await response.json();

    console.log(`Found ${invitations.length} invitations:`);
    invitations.forEach((inv, index) => {
      console.log(
        `${index + 1}. User: ${inv.githubUsername}, Status: ${inv.status}, DAO: ${inv.daoId?.name || inv.daoId}`,
      );
    });

    // Find a pending invitation
    const pendingInvitation = invitations.find((inv) => inv.status === "pending");
    if (pendingInvitation) {
      console.log("\nFound pending invitation:", pendingInvitation);
      return pendingInvitation;
    } else {
      console.log("\nNo pending invitations found.");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAllInvitations();