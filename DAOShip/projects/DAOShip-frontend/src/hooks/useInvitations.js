import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:3000/api";

export const useInvitations = (githubUsername) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch invitations for the current GitHub user
  const fetchInvitations = async () => {
    if (!githubUsername) {
      console.log('useInvitations: No GitHub username provided, skipping fetch');
      return;
    }
    
    console.log('useInvitations: Fetching invitations for username:', githubUsername);
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_URL}/invitations/github/${githubUsername}`;
      console.log('useInvitations: Making API call to:', url);
      const response = await axios.get(url);
      console.log('useInvitations: API response:', response.data);
      setInvitations(response.data);
    } catch (error) {
      console.error('useInvitations: Error fetching invitations:', error);
      setError(error.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  // Accept an invitation
  const acceptInvitation = async (invitationId, walletAddress) => {
    try {
      const response = await axios.patch(`${API_URL}/invitations/${invitationId}`, {
        status: 'accepted',
        walletAddress: walletAddress
      });
      
      // Update the local state
      setInvitations(prev => 
        prev.map(inv => 
          inv._id === invitationId 
            ? { ...inv, status: 'accepted', respondedAt: new Date() }
            : inv
        )
      );
      
      return { success: true, invitation: response.data };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to accept invitation' 
      };
    }
  };

  // Decline an invitation
  const declineInvitation = async (invitationId) => {
    try {
      const response = await axios.patch(`${API_URL}/invitations/${invitationId}`, {
        status: 'declined'
      });
      
      // Update the local state
      setInvitations(prev => 
        prev.map(inv => 
          inv._id === invitationId 
            ? { ...inv, status: 'declined', respondedAt: new Date() }
            : inv
        )
      );
      
      return { success: true, invitation: response.data };
    } catch (error) {
      console.error('Error declining invitation:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to decline invitation' 
      };
    }
  };

  // Get pending invitations count
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;

  // Get invitations by status
  const getInvitationsByStatus = (status) => {
    return invitations.filter(inv => inv.status === status);
  };

  // Auto-fetch when GitHub username changes
  useEffect(() => {
    if (githubUsername) {
      fetchInvitations();
    }
  }, [githubUsername]);

  return {
    invitations,
    loading,
    error,
    pendingCount,
    fetchInvitations,
    acceptInvitation,
    declineInvitation,
    getInvitationsByStatus
  };
};