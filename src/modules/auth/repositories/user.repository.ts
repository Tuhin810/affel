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

  async create(
    data: {
      name: string;
      email: string;
      passwordHash: string;
      referralCode: string;
    }
  ) {
    return prisma.user.create({
      data,
    });
  }
}