import { IUser } from "../models/User.js";
import * as userRepository from "../repositories/userRepository.js";

export function createUser(data: Partial<IUser>) {
  return userRepository.createUser(data);
}

export function getUsers() {
  return userRepository.getUsers();
}
