import { AppError } from "../../../core/exceptions/AppError";

import { HTTP_STATUS }
from "../../../common/constants/http-status.constants";

import { IConfigRepository }
from "../interfaces/IConfigRepository";

export class ConfigService {
  constructor(
    private readonly configRepository:
      IConfigRepository
  ) {}

  async get(
    key: string
  ): Promise<string> {
    const value =
      await this.configRepository.getValue(
        key
      );

    if (!value) {
      throw new AppError(
        `Config ${key} not found`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return value;
  }

  async set(
    key: string,
    value: string
  ): Promise<void> {
    await this.configRepository.setValue(
      key,
      value
    );
  }
}