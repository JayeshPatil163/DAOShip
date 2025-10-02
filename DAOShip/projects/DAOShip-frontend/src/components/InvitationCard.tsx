import React from "react";
import { CheckCircle, XCircle, Clock, Users, Calendar, Check, X } from "lucide-react";
import { useAccount } from "wagmi";

const InvitationCard = ({ invitation, onAccept, onDecline, isLoading = false }) => {
  const { daoId, status, invitedAt, githubUsername } = invitation;
  const dao = daoId; // This should be populated from the backend
  const { address } = useAccount();

  const getStatusIcon = () => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "expired":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "accepted":
        return "text-green-400 bg-green-900/30 border border-green-600/50";
      case "declined":
        return "text-red-400 bg-red-900/30 border border-red-600/50";
      case "expired":
        return "text-yellow-400 bg-yellow-900/30 border border-yellow-600/50";
      default:
        return "text-blue-400 bg-blue-900/30 border border-blue-600/50";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{dao?.name || "Unknown DAO"}</h3>
            <p className="text-gray-400">{dao?.description || "No description available"}</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize">{status}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Token</p>
          <p className="text-white font-medium">
            {dao?.tokenName && dao?.tokenSymbol ? `${dao.tokenName} (${dao.tokenSymbol})` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Invited</p>
          <p className="text-white flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(invitedAt)}
          </p>
        </div>
      </div>

      {/* Invitation Message */}
      <div className="p-3 bg-gray-700 rounded-lg mb-4">
        <p className="text-gray-300 text-sm">
          You've been invited to join the <strong className="text-white">{dao?.name}</strong> DAO as a collaborator.
          {dao?.tokenName && ` You'll receive ${dao.tokenName} tokens and can participate in governance.`}
        </p>
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex space-x-3">
          <button
            onClick={() => onAccept(invitation._id, address)}
            disabled={isLoading || !address}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>{isLoading ? "Accepting..." : "Accept"}</span>
          </button>

          <button
            onClick={() => onDecline(invitation._id)}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>{isLoading ? "Declining..." : "Decline"}</span>
          </button>
        </div>
      )}

      {!address && status === "pending" && (
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Connect your wallet</strong> to accept this invitation and receive DAO tokens.
          </p>
        </div>
      )}
    </div>
  );
};

export default InvitationCard;
