import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// DAO API calls
export const getAllDAOs = async () => {
  try {
    const response = await axios.get(`${API_URL}/dao`);
    return response.data;
  } catch (error) {
    console.error("Error fetching DAOs:", error);
    throw error;
  }
};

export const getDAO = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/dao/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching DAO with ID ${id}:`, error);
    throw error;
  }
};

export const createDAO = async (daoData) => {
  try {
    const response = await axios.post(`${API_URL}/dao`, daoData);
    return response.data;
  } catch (error) {
    console.error("Error creating DAO:", error);
    throw error;
  }
};

// Proposal API calls
export const getDAOProposals = async (daoId) => {
  try {
    const response = await axios.get(`${API_URL}/dao/${daoId}/proposals`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposals for DAO ${daoId}:`, error);
    throw error;
  }
};

export const getProposal = async (daoId, proposalId) => {
  try {
    const response = await axios.get(`${API_URL}/proposal/${proposalId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposal ${proposalId}:`, error);
    throw error;
  }
};

export const createProposal = async (daoId, proposalData) => {
  try {
    const response = await axios.post(`${API_URL}/dao/${daoId}/proposals`, proposalData);
    return response.data;
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const voteOnProposal = async (daoId, proposalId, vote) => {
  try {
    const response = await axios.post(`${API_URL}/proposal/${proposalId}/vote`, {
      vote,
    });
    return response.data;
  } catch (error) {
    console.error(`Error voting on proposal ${proposalId}:`, error);
    throw error;
  }
};

// User API calls
export const getUserByWalletAddress = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_URL}/user/wallet/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with wallet address ${walletAddress}:`, error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/user`, userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

export const getUserDAOs = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}/daos`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching DAOs for user ${userId}:`, error);
    throw error;
  }
};