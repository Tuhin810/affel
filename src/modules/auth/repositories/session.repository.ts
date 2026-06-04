import prisma from "../../../database/prisma/client";

export class SessionRepository {

  async create(
    data: {
      userId: string;
      refreshTokenHash: string;
      expiresAt: Date;
      deviceInfo?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {

    return prisma.userSession.create({
      data,
    });

  }
  async deleteByRefreshTokenHash(
    refreshTokenHash: string
  ) {

    return prisma.userSession.deleteMany({
      where: {
        refreshTokenHash,
      },
    });

  }

  async findByRefreshTokenHash(
    refreshTokenHash: string
  ) {

    return prisma.userSession.findFirst({
      where: {
        refreshTokenHash,
      },
    });

  }

  async updateRefreshTokenHash(
    sessionId: string,
    refreshTokenHash: string
  ) {

    return prisma.userSession.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash,
        lastUsedAt:
          new Date(),
      },
    });

  }

  async deleteAllByUserId(
    userId: string
  ) {

    return prisma.userSession.deleteMany({
      where: {
        userId,
      },
    });

  }
}