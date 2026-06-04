import prisma from "../../../database/prisma/client";

export class UserRepository {

  async findByEmail(
    email: string
  ) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async findByPhone(
    phone: string
    ) {
    return prisma.user.findUnique({
        where: {
        phone,
        },
    });
    }

  async create(
    data: {
      name: string;
      email: string;
      phone: string;
      isEmailVerified: boolean;
    }
  ) {
    return prisma.user.create({
      data,
    });
  }

  async updateLastLogin(
    userId: string
  ) {

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt:
          new Date(),
      },
    });

  }

  async findById(
  id: string
) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}
}