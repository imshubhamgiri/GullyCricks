import React from "react";
import { Button, InputField, ErrorAlert } from "@/components/ui";

interface CreateMatchFormProps {
  adminName: string;
  overs: number;
  players: number;
  wideRuns: number;
  noBallRuns: number;
  loading: boolean;
  error: string | null;
  onAdminNameChange: (value: string) => void;
  onOversChange: (value: number) => void;
  onPlayersChange: (value: number) => void;
  onWideRunsChange: (value: number) => void;
  onNoBallRunsChange: (value: number) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export const CreateMatchForm: React.FC<CreateMatchFormProps> = ({
  adminName,
  overs,
  players,
  wideRuns,
  noBallRuns,
  loading,
  error,
  onAdminNameChange,
  onOversChange,
  onPlayersChange,
  onWideRunsChange,
  onNoBallRunsChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Your Name (Admin)"
        placeholder="Enter your name"
        value={adminName}
        onChange={(e) => onAdminNameChange(e.target.value)}
      />

      <div className="bg-slate-900/30 border border-slate-600/30 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-amber-300">Match Settings</h3>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Overs"
            type="number"
            value={overs}
            onChange={(e) => onOversChange(Number(e.target.value) || 0)}
            min="1"
            max="50"
          />

          <InputField
            label="Players"
            type="number"
            value={players}
            onChange={(e) => onPlayersChange(Number(e.target.value) || 0)}
            min="1"
            max="15"
          />

          <InputField
            label="Wide Runs"
            type="number"
            value={wideRuns}
            onChange={(e) => onWideRunsChange(Number(e.target.value) || 0)}
            min="0"
            max="10"
          />

          <InputField
            label="No Ball Runs"
            type="number"
            value={noBallRuns}
            onChange={(e) => onNoBallRunsChange(Number(e.target.value) || 0)}
            min="0"
            max="10"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          fullWidth
          variant="primary"
        >
          {loading ? "Creating..." : "Create Match"}
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
