import React from "react";

interface UserCardProps {
  displayName: string;
  role: "admin" | "viewer";
}

export const UserCard: React.FC<UserCardProps> = ({ displayName, role }) => {
  const isAdmin = role === "admin";
  const dotColor = isAdmin ? "bg-amber-400" : "bg-green-400";
  const roleText = isAdmin ? "Admin" : "Viewer";
  const roleColor = isAdmin ? "text-amber-400" : "text-slate-400";

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
      <div>
        <p className="text-white font-medium text-sm">{displayName}</p>
        <p className={`${roleColor} text-xs`}>{roleText}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
    </div>
  );
};
