import { AuthService } from "./services/auth.service";
import { UserRepository } from "./repositories/user.repository";
import { SessionRepository } from "./repositories/session.repository";
import { JwtService } from "./services/jwt.service";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
export const jwtService = new JwtService();

export const authService = new AuthService(
  userRepository,
  sessionRepository,
  jwtService
);