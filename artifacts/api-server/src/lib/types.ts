import type { User } from "@workspace/db/schema";

export type AuthenticatedUser = Omit<User, "passwordHash">;

declare global {
  namespace Express {
    interface User extends Omit<import("@workspace/db/schema").User, "passwordHash"> {}
  }
}
