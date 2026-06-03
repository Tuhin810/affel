import prisma from "../../../database/prisma/client";

import { IConfigRepository } from "../interfaces/IConfigRepository";

export class ConfigRepository
  implements IConfigRepository
{
  async getValue(
    key: string
  ): Promise<string | null> {
    const config =
      await prisma.appConfig.findUnique({
        where: {
          key,
        },
      });

    return config?.value ?? null;
  }

  async setValue(
    key: string,
    value: string
  ): Promise<void> {
    await prisma.appConfig.update({
      where: {
        key,
      },
      data: {
        value,
      },
    });
  }
}