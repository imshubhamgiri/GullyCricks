import React, { useState, useMemo } from "react";

interface Ball {
  type: "dot" | "run" | "wicket" | "wide" | "noBall";
  runs?: number;
  countedBall?: boolean;
}

interface BallHistoryProps {
  ballHistory?: Ball[];
  currentOverBalls?: string[];
}

/**
 * Ball History Component
 * Displays current over and allows navigation through previous overs
 */
export const BallHistory: React.FC<BallHistoryProps> = ({
  ballHistory = [],
  currentOverBalls = [],
}) => {
  const [currentOverIndex, setCurrentOverIndex] = useState<number | null>(null);

  // Group balls into overs
  const overs = useMemo(() => {
    if (ballHistory.length === 0) return [];

    let overGroups: string[][] = [];
    let currentGroup: string[] = [];
    let validBalls = 0;

    ballHistory.forEach((ball) => {
      let label = "0";
      if (ball.type === "wicket") label = "W";
      else if (ball.type === "wide") label = "Wd";
      else if (ball.type === "noBall") label = "Nb";
      else if (ball.type === "run") label = (ball.runs || 0).toString();

      currentGroup.push(label);

      if (ball.countedBall) validBalls += 1;

      if (validBalls > 0 && validBalls % 6 === 0 && ball.countedBall) {
        overGroups.push([...currentGroup]);
        currentGroup = [];
      }
    });

    return overGroups;
  }, [ballHistory]);

  // Get color for ball display
  const getBallColor = (ball: string): string => {
    if (ball === "W") return "#e03131"; // Red for wicket
    if (ball === "Wd") return "#e8590c"; // Orange for wide
    if (ball.startsWith("Nb")) {
      // No ball - check if it's Nb-W (wicket) or Nb with runs
      if (ball === "Nb-W") return "#e03131"; // Red for no ball wicket
      return "#e8590c"; // Orange for no ball with runs
    }
    if (ball === "4" || ball === "6") return "#1971c2"; // Blue for boundaries
    return "#333"; // Dark for dots and other runs
  };

  // Handle navigation
  const handlePreviousOver = () => {
    if (currentOverIndex === null && overs.length > 0) {
      setCurrentOverIndex(overs.length - 1);
    } else if (currentOverIndex !== null && currentOverIndex > 0) {
      setCurrentOverIndex(currentOverIndex - 1);
    }
  };

  const handleNextOver = () => {
    if (currentOverIndex !== null) {
      if (currentOverIndex < overs.length - 1) {
        setCurrentOverIndex(currentOverIndex + 1);
      } else {
        setCurrentOverIndex(null);
      }
    }
  };

  // Display current over or selected past over
  const displayBalls =
    currentOverIndex !== null ? overs[currentOverIndex] : currentOverBalls;
  const displayOverNumber =
    currentOverIndex !== null ? currentOverIndex + 1 : "Current";

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Over History</h3>
        {overs.length > 0 && (
          <span className="text-sm text-slate-400">
            Over {displayOverNumber} / {overs.length}
          </span>
        )}
      </div>

      {/* Current/Selected Over Display */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <div className="inline-block bg-amber-500/20 border border-amber-500/50 rounded-lg px-4 py-2">
            <span className="text-amber-300 font-semibold">
              {displayOverNumber === "Current" ? "Current Over" : `Over ${displayOverNumber}`}
            </span>
          </div>
        </div>

        {/* Ball Circles */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 min-h-15">
          {displayBalls && displayBalls.length > 0 ? (
            displayBalls.map((ball, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center font-bold bg-slate-900/50 shadow-lg hover:border-amber-400 transition"
                style={{ color: getBallColor(ball) }}
              >
                {ball}
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm italic">
              No balls in this over yet
            </div>
          )}
        </div>

        {/* Ball Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-400 px-4 py-3 bg-slate-900/30 rounded-lg">
          <div>
            <span style={{ color: "#333" }} className="font-bold">
              0
            </span>{" "}
            - Dot Ball
          </div>
          <div>
            <span style={{ color: "#1971c2" }} className="font-bold">
              1-6
            </span>{" "}
            - Runs
          </div>
          <div>
            <span style={{ color: "#e03131" }} className="font-bold">
              W
            </span>{" "}
            - Wicket
          </div>
          <div>
            <span style={{ color: "#e8590c" }} className="font-bold">
              Wd
            </span>{" "}
            - Wide
          </div>
          <div>
            <span style={{ color: "#e8590c" }} className="font-bold">
              Nb-#
            </span>{" "}
            - No Ball
          </div>
        </div>
      </div>

      {/* Navigation */}
      {overs.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousOver}
            disabled={currentOverIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            <span>←</span> Previous Over
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg">
            {overs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentOverIndex(idx)}
                className={`w-8 h-8 rounded-full font-bold text-xs transition ${
                  currentOverIndex === idx
                    ? "bg-amber-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentOverIndex(null)}
              className={`w-8 h-8 rounded-full font-bold text-xs transition ${
                currentOverIndex === null
                  ? "bg-amber-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              title="Current Over"
            >
              •
            </button>
          </div>

          <button
            onClick={handleNextOver}
            disabled={currentOverIndex === null || currentOverIndex === overs.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Next Over <span>→</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {overs.length === 0 && currentOverBalls.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            No balls bowled yet. Start the match!
          </p>
        </div>
      )}
    </div>
  );
};
