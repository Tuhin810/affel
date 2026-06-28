import prisma from "../../../database/prisma/client";
import { ConversionStatus } from "@prisma/client";

export class ConversionRepository {
  public async createConversion(data: {
    clickId?: string | null;
    transactionId: string;
    orderAmount: number;
    commissionAmount: number;
    cashbackAmount: number;
    status: ConversionStatus;
    conversionDate?: Date;
  }) {
    return prisma.conversion.create({
      data: {
        clickId: data.clickId || null,
        transactionId: data.transactionId,
        orderAmount: data.orderAmount,
        commissionAmount: data.commissionAmount,
        cashbackAmount: data.cashbackAmount,
        status: data.status,
        conversionDate: data.conversionDate || new Date(),
      },
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
