import React from 'react';
import { Bell, Mail } from 'lucide-react';

const InvitationBadge = ({
  count = 0,
  onClick,
  className = "",
  showIcon = true
}) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${className}`}
      title={`${count} pending invitation${count !== 1 ? 's' : ''}`}
      aria-label={`${count} pending invitation${count !== 1 ? 's' : ''}`}
    >
      {showIcon && <Mail className="h-5 w-5 text-white" />}

      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[1.25rem] h-5">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default InvitationBadge;
