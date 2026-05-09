import User, { IUser } from "../models/User.js";

export function createUser(payload: Partial<IUser>) {
  return User.create(payload);
}

export function getUsers() {
  return User.find().sort({ createdAt: -1 });
}
