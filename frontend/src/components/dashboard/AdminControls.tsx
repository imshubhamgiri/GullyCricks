import React, { useState } from "react";
import { Button } from "@/components/ui";

interface AdminControlsProps {
  isAdmin: boolean;
  onScoreUpdate: (type: string, runs: number) => void;
  loading?: boolean;
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  isAdmin,
  onScoreUpdate,
  loading = false,
}) => {
  const [showNoBallOptions, setShowNoBallOptions] = useState(false);

  const handleNoBallOption = (runs: number) => {
    onScoreUpdate("noBall", runs);
    setShowNoBallOptions(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4">Update Score</h3>
      
      {!showNoBallOptions ? (
        <>
          {/* Regular Runs Section */}
          <div className="mb-4">
            <p className="text-slate-300 text-xs font-semibold mb-2">Regular Runs</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() => onScoreUpdate("dot", 0)}
                disabled={loading}
                variant="secondary"
                fullWidth
                className="text-xs"
              >
                Dot
              </Button>
              <Button
                onClick={() => onScoreUpdate("run", 1)}
                disabled={loading}
                variant="success"
                fullWidth
                className="text-xs"
              >
                +1 Run
              </Button>
              <Button
                onClick={() => onScoreUpdate("run", 2)}
                disabled={loading}
                variant="warning"
                fullWidth
                className="text-xs"
              >
                +2 Runs
              </Button>
              <Button
                onClick={() => onScoreUpdate("run", 3)}
                disabled={loading}
                variant="warning"
                fullWidth
                className="text-xs"
              >
                +3 Runs
              </Button>
            </div>
          </div>

          {/* Boundaries Section */}
          <div className="mb-4">
            <p className="text-slate-300 text-xs font-semibold mb-2">Boundaries</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onScoreUpdate("run", 4)}
                disabled={loading}
                variant="secondary"
                fullWidth
                className="text-sm font-bold"
              >
                🟦 Four
              </Button>
              <Button
                onClick={() => onScoreUpdate("run", 6)}
                disabled={loading}
                variant="success"
                fullWidth
                className="text-sm font-bold"
              >
                🟦 Six
              </Button>
            </div>
          </div>

          {/* Extras Section */}
          <div className="mb-4">
            <p className="text-slate-300 text-xs font-semibold mb-2">Extras</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onScoreUpdate("wide", 1)}
                disabled={loading}
                variant="warning"
                fullWidth
                className="text-xs"
              >
                Wide
              </Button>
              <Button
                onClick={() => setShowNoBallOptions(true)}
                disabled={loading}
                variant="warning"
                fullWidth
                className="text-xs"
              >
                No Ball
              </Button>
            </div>
          </div>

          {/* Dismissal Section */}
          <div className="mb-4">
            <p className="text-slate-300 text-xs font-semibold mb-2">Dismissal</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => onScoreUpdate("wicket", 0)}
                disabled={loading}
                variant="danger"
                fullWidth
              >
                🔴 Wicket
              </Button>
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-3 border-t border-slate-700 pt-3">
            Note: Admin score updates will broadcast to all viewers in real-time! ⚡
          </p>
        </>
      ) : (
        <>
          {/* No Ball Options Modal */}
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full">
              <h4 className="text-white font-bold mb-4">No Ball - Select Runs</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  onClick={() => handleNoBallOption(0)}
                  variant="secondary"
                  fullWidth
                >
                  Dot
                </Button>
                <Button
                  onClick={() => handleNoBallOption(1)}
                  variant="success"
                  fullWidth
                >
                  +1
                </Button>
                <Button
                  onClick={() => handleNoBallOption(2)}
                  variant="warning"
                  fullWidth
                >
                  +2
                </Button>
                <Button
                  onClick={() => handleNoBallOption(3)}
                  variant="warning"
                  fullWidth
                >
                  +3
                </Button>
                <Button
                  onClick={() => handleNoBallOption(4)}
                  variant="warning"
                  fullWidth
                >
                  4 Runs
                </Button>
                <Button
                  onClick={() => handleNoBallOption(6)}
                  variant="warning"
                  fullWidth
                >
                  6 Runs
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleNoBallOption(-1)}
                  variant="danger"
                  fullWidth
                >
                  Run Out
                </Button>
                <Button
                  onClick={() => setShowNoBallOptions(false)}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
