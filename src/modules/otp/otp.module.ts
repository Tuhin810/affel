import { OtpGeneratorService }
from "./services/otp-generator.service";

import { OtpCacheService }
from "./services/otp-cache.service";

import { OtpService }
from "./services/otp.service";

const otpGenerator =
  new OtpGeneratorService();

const otpCacheService =
  new OtpCacheService();

export const otpService =
  new OtpService(
    otpGenerator,
    otpCacheService
  );