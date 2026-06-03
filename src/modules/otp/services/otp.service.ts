import { OtpGeneratorService } from "./otp-generator.service";
import { OtpCacheService } from "./otp-cache.service";

export class OtpService {
  constructor(
    private readonly otpGenerator: OtpGeneratorService,
    private readonly otpCacheService: OtpCacheService
  ) {}

  async generateAndStoreOtp(
    email: string,
    ttlSeconds: number
  ): Promise<string> {

    const otp = this.otpGenerator.generate();

    await this.otpCacheService.saveOtp(
      `otp:email:${email}`,
      otp,
      ttlSeconds
    );

    return otp;
  }

  async verifyOtp(
    email: string,
    otp: string
  ): Promise<boolean> {

    const storedOtp =
      await this.otpCacheService.getOtp(
        `otp:email:${email}`
      );

    if (!storedOtp) {
      return false;
    }

    if (storedOtp !== otp) {
      return false;
    }

    await this.otpCacheService.deleteOtp(
      `otp:email:${email}`
    );

    await this.otpCacheService.saveOtp(
      `verified:email:${email}`,
      "true",
      900
    );

    return true;
  }
}