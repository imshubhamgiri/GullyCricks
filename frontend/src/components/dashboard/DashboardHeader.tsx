import React from "react";

interface DashboardHeaderProps {
  matchCode: string;
  createdBy: string;
  isAdmin: boolean;
  isConnected: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  matchCode,
  createdBy,
  isAdmin,
  isConnected,
}) => {
  return (
    <div className="border-b border-amber-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-300">
              Match {matchCode}
            </h1>
            <p className="text-slate-400 text-sm mt-2">Created by: {createdBy}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-slate-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            {isAdmin && (
              <span className="inline-block bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-xs">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
