import prisma from "../../../database/prisma/client";

export class SessionRepository {

  async create(
    data: {
      userId: string;
      refreshTokenHash: string;
      expiresAt: Date;
    }
  ) {

    return prisma.userSession.create({
      data,
    });

  }
}