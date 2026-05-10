import Match from "../models/Match.js";

export function createMatch(payload: Record<string, unknown>) {
  return Match.create(payload);
}

export function getMatches() {
  return Match.find().sort({ createdAt: -1 });
}

export function getMatchById(id: string) {
  return Match.findById(id);
}

export function updateMatch(id: string, updateData: any) {
  return Match.findByIdAndUpdate(id, updateData, { new: true });
}
 