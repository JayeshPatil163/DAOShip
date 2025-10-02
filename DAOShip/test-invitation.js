// Simple test script to verify invitation acceptance works
const API_URL = "http://localhost:3000/api";

async function testInvitationAcceptance() {
  try {
    // First, get invitations for a test user
    console.log('1. Getting invitations for user "aniketwarule"...');
    const response = await fetch(`${API_URL}/invitations/github/aniketwarule`);
    const invitations = await response.json();
    console.log("Invitations:", invitations);

    if (invitations.length > 0) {
      const invitation = invitations[0];
      console.log(`\n2. Attempting to accept invitation ${invitation._id}...`);

      // Test accepting the invitation
      const acceptResponse = await fetch(`${API_URL}/invitations/${invitation._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "accepted",
          walletAddress: "0x1234567890123456789012345678901234567890",
        }),
      });

      const result = await acceptResponse.json();
      console.log("Accept result:", result);

      // Get DAO details to verify member was added
      if (invitation.daoId) {
        console.log(`\n3. Checking DAO ${invitation.daoId._id} members...`);
        const daoResponse = await fetch(`${API_URL}/dao/${invitation.daoId._id}`);
        const dao = await daoResponse.json();
        console.log("DAO members:", dao.members);
      }
    } else {
      console.log('No invitations found for user "aniketwarule"');
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testInvitationAcceptance();