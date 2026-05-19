import mongoose from "mongoose";

// Type definitions
export interface IBallEvent {
  type: "run" | "wide" | "noBall" | "wicket" | "dot";
  runs?: number;
  countedBall?: boolean;
  isExtra?: boolean;
  over?: number | null;
  ball?: number | null;
  timestamp?: Date;
}

export interface ISettings {
  overs: number;
  players: number;
  wideRuns: number;
  noBallRuns: number;
}

export const BallEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["run", "wide", "noBall", "wicket", "dot"],
      required: true,
    },

    runs: {
      type: Number,
      default: 0,
    },

    countedBall: {
      type: Boolean,
      default: true,
    },

    isExtra: {
      type: Boolean,
      default: false,
    },

    over: Number,

    ball: Number,

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    visitorId: String,

    displayName: String,

    role: {
      type: String,
      enum: ["viewer", "admin"],
      default: "viewer",
    },
  },
  { _id: false }
);

const MatchSchema = new mongoose.Schema(
  {
    matchCode: {
      type: String,
      unique: true,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    admins: [String],

    users: [UserSchema],

    settings: {
    type: {
        overs: {
          type: Number,
          default: 5,
        },

      players: {
        type: Number,
        default: 11,
      },

      wideRuns: {
        type: Number,
        default: 1,
      },

      noBallRuns: {
        type: Number,
        default: 1,
      },
    },
      required: true,
    },

    score: {
      runs: {
        type: Number,
        default: 0,
      },

      wickets: {
        type: Number,
        default: 0,
      },

      overs: {
        type: Number,
        default: 0,
      },

      balls: {
        type: Number,
        default: 0,
      },

      currentOverBalls: {
        type: [String],
        default: [],
      },
    },

    ballHistory: {
      type: [BallEventSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["live", "completed"],
      default: "live",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ OPTIMIZED: Add indexes for frequently queried fields
// This speeds up: findOne({ matchCode }), find({ status })
MatchSchema.index({ status: 1 });
MatchSchema.index({ createdAt: -1 });

export default mongoose.model("Match", MatchSchema);
