import jwt from "jsonwebtoken";

import { env }
from "../../../config/env";

export class JwtService {

  generateAccessToken(
    userId: string,
    role: string
  ): string {

    return jwt.sign(
      {
        userId,
        role,
      },
      env.jwtSecret,
      {
        expiresIn: "1d",
      }
    );
  }

  generateRefreshToken(
    userId: string,
    role: string
  ): string {

    return jwt.sign(
      {
        userId,
        role,
      },
      env.jwtRefreshSecret,
      {
        expiresIn: "30d",
      }
    );
  }

  verifyAccessToken(
    token: string
  ): any {

    return jwt.verify(
      token,
      env.jwtSecret
    );
  }

  verifyRefreshToken(
    token: string
  ): any {

    return jwt.verify(
      token,
      env.jwtRefreshSecret
    );
  }
}