import React from "react";
import { ConnectionStatus } from "./ConnectionStatus";

export const EntryHeader: React.FC<{ isConnected: boolean }> = ({
  isConnected,
}) => {
  return (
    <div className="border-b border-amber-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-300">
          GullyCricks
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Real-time Cricket Scoring Platform
        </p>
        <ConnectionStatus isConnected={isConnected} />
      </div>
    </div>
  );
};
