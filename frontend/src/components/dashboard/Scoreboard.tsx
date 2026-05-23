import React from "react";
import { Card } from "@/components/ui";
import { ScoreCard } from "./ScoreCard";
import { AdminControls } from "./AdminControls";

interface ScoreboardProps {
  score: number;
  wickets: number;
  overs: number;
  isAdmin: boolean;
  loading?: boolean;
  onScoreUpdate: (type: string, runs: number) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  score,
  wickets,
  overs,
  isAdmin,
  loading = false,
  onScoreUpdate,
}) => {
  const strikeRate = wickets === 0 ? score : "-";

  return (
    <Card className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-8">Scoreboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <ScoreCard
          value={score}
          label="Runs"
          bgColor="bg-linear-to-br from-blue-600 to-blue-700"
          textColor="text-blue-200"
        />
        <ScoreCard
          value={wickets}
          label="Wickets"
          bgColor="bg-linear-to-br from-red-600 to-red-700"
          textColor="text-red-200"
        />
        <ScoreCard
          value={overs}
          label="Overs"
          bgColor="bg-linear-to-br from-purple-600 to-purple-700"
          textColor="text-purple-200"
        />
        <ScoreCard
          value={typeof strikeRate === "number" ? strikeRate : 0}
          label="Rate"
          bgColor="bg-linear-to-br from-amber-600 to-amber-700"
          textColor="text-amber-200"
        />
      </div>

      <AdminControls
        isAdmin={isAdmin}
        onScoreUpdate={onScoreUpdate}
        loading={loading}
      />
    </Card>
  );
};
