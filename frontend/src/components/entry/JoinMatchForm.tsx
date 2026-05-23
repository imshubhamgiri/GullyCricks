import React from "react";
import { Button, InputField, ErrorAlert } from "@/components/ui";

interface JoinMatchFormProps {
  matchCode: string;
  playerName: string;
  loading: boolean;
  error: string | null;
  onMatchCodeChange: (value: string) => void;
  onPlayerNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const JoinMatchForm: React.FC<JoinMatchFormProps> = ({
  matchCode,
  playerName,
  loading,
  error,
  onMatchCodeChange,
  onPlayerNameChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Match Code"
        placeholder="e.g., ABC123"
        value={matchCode}
        onChange={(e) => onMatchCodeChange(e.target.value)}
        className="uppercase"
      />

      <InputField
        label="Your Name"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          fullWidth
          variant="primary"
        >
          {loading ? "Joining..." : "Join Match"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          fullWidth
          variant="secondary"
        >
          Cancel
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}
    </form>
  );
};
