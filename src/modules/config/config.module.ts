import { ConfigRepository }
from "./repositories/config.repository";

import { ConfigService }
from "./services/config.service";

const configRepository =
  new ConfigRepository();

export const configService =
  new ConfigService(
    configRepository
  );