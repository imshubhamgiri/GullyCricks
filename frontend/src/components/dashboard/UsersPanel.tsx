import React from "react";
import { Card, Button } from "@/components/ui";
import { UserCard } from "./UserCard";
import type { User } from "@/hooks/useMatchData";

interface UsersPanelProps {
  users: User[];
  matchCode: string;
  onLeaveMatch: () => void;
  onCopyCode: (code: string) => void;
  copied: boolean;
}

export const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  matchCode,
  onLeaveMatch,
  onCopyCode,
  copied,
}) => {
  return (
    <Card className="sticky top-8">
      <h3 className="text-xl font-bold text-white mb-4">Users ({users.length})</h3>

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {users.map((user) => (
          <UserCard key={user.visitorId} displayName={user.displayName} role={user.role} />
        ))}
      </div>

      <Button onClick={onLeaveMatch} variant="danger" fullWidth className="mb-4">
        Leave Match
      </Button>

      <div className="bg-slate-900/50 rounded-lg p-3">
        <p className="text-slate-400 text-xs mb-2">Share this code:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-800 rounded px-2 py-1">
            <p className="text-white font-mono text-lg">{matchCode}</p>
          </div>
          <Button
            onClick={() => onCopyCode(matchCode)}
            variant={copied ? "success" : "primary"}
            className="text-sm px-3 py-1"
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
