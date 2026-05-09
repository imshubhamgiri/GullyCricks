import Match from "../models/Match.js";

export function createMatch(payload: Record<string, unknown>) {
  return Match.create(payload);
}

export function getMatches() {
  return Match.find().sort({ createdAt: -1 });
}
