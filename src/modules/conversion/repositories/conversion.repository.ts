import prisma from "../../../database/prisma/client";
import { ConversionStatus } from "@prisma/client";

export class ConversionRepository {
  public async createConversion(data: {
    clickId: string;
    transactionId: string;
    networkId: string;
    orderAmount: number;
    commissionAmount: number;
    cashbackAmount: number;
    status: ConversionStatus;
    conversionDate: Date;
  }) {
    return prisma.conversion.create({
      data,
    });
  }

  public async findByTransactionId(transactionId: string) {
    return prisma.conversion.findUnique({
      where: { transactionId },
    });
  }

  public async updateStatus(id: string, status: ConversionStatus) {
    return prisma.conversion.update({
      where: { id },
      data: { status },
    });
  }

  public async findById(id: string) {
    return prisma.conversion.findUnique({
      where: { id },
      include: {
        click: true,
      },
    });
  }
}
