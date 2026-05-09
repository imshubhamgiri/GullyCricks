import * as matchRepository from "../repositories/matchRepository.js";

export function createMatch(data: Record<string, unknown>) {
  return matchRepository.createMatch(data);
}

export function getMatches() {
  return matchRepository.getMatches();
}
