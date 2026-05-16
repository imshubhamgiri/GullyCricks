import {  IBallEvent, ISettings } from '../models/Match.js';

export default function recalculateScore(ballHistory: IBallEvent[], settings: ISettings) {
  let runs = 0;
  let wickets = 0;
  let validBalls = 0;
  let currentOverBalls: string[] = [];

  for (const ball of ballHistory) {
    if (ball.type === "wicket") {
      wickets += 1;
      validBalls += 1;
      currentOverBalls.push("W");
    } else if (ball.type === "run") {
      runs += ball.runs ?? 0;
      validBalls += 1;
      currentOverBalls.push((ball.runs ?? 0).toString());
    } else if (ball.type === "dot") {
      validBalls += 1;
      currentOverBalls.push("0");
    } else if (ball.type === "wide") {
      runs += ball.runs || settings.wideRuns || 1;
      currentOverBalls.push("Wd");
    } else if (ball.type === "noBall") {
      runs += ball.runs || settings.noBallRuns || 1;
      currentOverBalls.push("Nb");
    }

    if (validBalls > 0 && validBalls % 6 === 0 && ["wicket", "run", "dot"].includes(ball.type)) {
      currentOverBalls = [];
    }
  }

  const overs = Math.floor(validBalls / 6);
  const balls = validBalls % 6;

  return {
    runs,
    wickets,
    overs,
    balls,
    currentOverBalls,
  };
}