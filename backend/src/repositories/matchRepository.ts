import Match from "../models/Match.js";

export function createMatch(payload: Record<string, unknown>) {
  return Match.create(payload);
}

export function getMatches(limit: number = 20, skip: number = 0) {
  // ✅ OPTIMIZED: Add limit (don't fetch all matches) + skip for pagination
  return Match.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
}

export function getMatchById(id: string) {
  return Match.findById(id).lean();
}

export function getMatchByCode(code: string) {
  return Match.findOne({ matchCode: code }).lean();
}

export function updateMatch(id: string, updateData: any) {
  return Match.findByIdAndUpdate(id, updateData, {  returnDocument: 'after' });
}
 