import * as matchRepository from "../repositories/matchRepository.js";
import { generateMatchCode  } from "../utlis/generateMatchCode.js";
import recalculateScore from "../utlis/recalculateScore.js";

interface MatchSettings {
  overs: number;
  players: number;
  wideRuns: number;
  noBallRuns: number;
}
export interface CreateMatchData {
  visitorId: string;
  displayName: string;
  settings: MatchSettings;
}
export interface updateMatchData {
  visitorId: string;
  event: {
    type: "run" | "wide" | "noBall" | "wicket" | "dot";
    runs?: number;
  };
}
export function createMatch(data: CreateMatchData) {
  const newMatchData = {
      matchCode: generateMatchCode(),

      createdBy: data.visitorId,

      admins: [data.visitorId],

      users: [
         {
            visitorId: data.visitorId,
            displayName: data.displayName,
            role: "admin"
         }
      ],

      settings: data.settings,

      score: {
         runs: 0,
         wickets: 0,
         overs: 0,
         balls: 0,
         currentOverBalls: []
      },

      ballHistory: [],

      status: "live"
   };

  return matchRepository.createMatch(newMatchData);
}

export function getMatches(limit: number = 20, skip: number = 0) {
  // ✅ OPTIMIZED: Support pagination with limit
  return matchRepository.getMatches(limit, skip);
}



export async function updateMatch(matchId: string, data: updateMatchData) {
  const match = await matchRepository.getMatchById(matchId);
  
  if (!match) {
    throw new Error("Match not found");
  }

  const { visitorId, event } = data;
  
  const isAdmin = match.admins.includes(visitorId);
  if (!isAdmin) {
    throw new Error("Not authorized to update this match");
  }

  const score = recalculateScore(match.ballHistory, match.settings);

  // Parse new ball event
  let newBall: any = {
    type: event.type,
    runs: event.runs || 0,
    countedBall: true,
    isExtra: false,
    over: score.overs,
    ball: score.balls + 1,
    timestamp: new Date()
  };

  if (event.type === "wide") {
    newBall.runs = event.runs || match.settings!.wideRuns || 1;
    newBall.countedBall = false;
    newBall.isExtra = match.settings!.wideRuns===1 ? true : false;
    newBall.ball = score.balls; 
  } else if (event.type === "noBall") {
    newBall.runs = event.runs || match.settings!.noBallRuns || 1;
    newBall.countedBall = false;
    newBall.isExtra =match.settings!.noBallRuns ==1 ? true : false;
    newBall.ball = score.balls;
  } else if (event.type === "run") {
    newBall.countedBall = true;
    newBall.isExtra = false;
  } else if (event.type === "wicket") {
    newBall.countedBall = true;
    newBall.isExtra = false;
  } else if (event.type === "dot") {
    newBall.countedBall = true;
    newBall.isExtra = false;
  }

  match.ballHistory.push(newBall);

  // Recalculate score with the new ball included
  const newScore = recalculateScore(match.ballHistory, match.settings);

  return matchRepository.updateMatch(matchId, {
    score: newScore,
    ballHistory: match.ballHistory
  });
}
