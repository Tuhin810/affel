import jwt from "jsonwebtoken";

import { env }
from "../../../config/env";

export class JwtService {

  generateAccessToken(
    userId: string
  ): string {

    return jwt.sign(
      {
        userId,
      },
      env.jwtSecret,
      {
        expiresIn: "15m",
      }
    );
  }

  generateRefreshToken(
    userId: string
  ): string {

    return jwt.sign(
      {
        userId,
      },
      env.jwtRefreshSecret,
      {
        expiresIn: "30d",
      }
    );
  }
}