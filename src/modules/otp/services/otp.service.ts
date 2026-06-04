import { randomUUID } from "crypto";
import { OtpGeneratorService } from "./otp-generator.service";
import { OtpCacheService } from "./otp-cache.service";

export class OtpService {
  constructor(
    private readonly otpGenerator: OtpGeneratorService,
    private readonly otpCacheService: OtpCacheService
  ) { }

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

    return true;
  }

  async createVerificationToken(
    email: string
  ): Promise<string> {
    const token = randomUUID();

    await this.otpCacheService.saveOtp(
      `verification:${token}`,
      email,
      120
    );

    return token;
  }

  async validateVerificationToken(
    token: string
  ): Promise<string | null> {
    return this.otpCacheService.getOtp(
      `verification:${token}`
    );
  }

  async deleteVerificationToken(
    token: string
  ): Promise<void> {
    await this.otpCacheService.deleteOtp(
      `verification:${token}`
    );
  }
}