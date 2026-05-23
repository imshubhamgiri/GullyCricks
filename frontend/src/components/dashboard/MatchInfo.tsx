import React from "react";
import { Card } from "@/components/ui";

interface MatchInfoProps {
  totalOvers: number;
  totalPlayers: number;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({
  totalOvers,
  totalPlayers,
}) => {
  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Match Info</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-sm">Total Overs</p>
          <p className="text-white font-bold">{totalOvers}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Players</p>
          <p className="text-white font-bold">{totalPlayers}</p>
        </div>
      </div>
    </Card>
  );
};
