import { otpService }
  from "../../otp/otp.module";

import { emailService }
  from "../../email/email.module";

import { configService }
  from "../../config/config.module";

import { AppError } from "../../../common/errors/app.error";

import prisma from "../../../database/prisma/client";

import { sha256 }
from "../../../common/utils/hash.util";

import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { JwtService } from "./jwt.service";
import { RegisterDto } from "../dto/register.dto";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService
  ) {}

  async sendEmailOtp(
    email: string
  ): Promise<void> {

    console.time("CONFIG");

    const otpExpiry =
      await configService.get(
        "OTP_EXPIRY_SECONDS"
      );

    console.timeEnd("CONFIG");

    console.time("OTP");

    const otp =
      await otpService.generateAndStoreOtp(
        email,
        Number(otpExpiry)
      );

    console.timeEnd("OTP");

    console.time("EMAIL");

    await emailService.sendOtpEmail(
      email,
      otp
    );

    console.timeEnd("EMAIL");
  }

  async verifyEmailOtp(
    email: string,
    otp: string
  ): Promise<string> {

    const valid =
      await otpService.verifyOtp(
        email,
        otp
      );

    if (!valid) {
      throw new AppError(
        "Invalid OTP",
        400
      );
    }

    return otpService.createVerificationToken(
      email
    );
  }

  async register(
    dto: RegisterDto
  ) {

    const verifiedEmail =
      await otpService.validateVerificationToken(
        dto.verificationToken
      );

    if (!verifiedEmail) {
      throw new AppError(
        "Verification token expired",
        400
      );
    }

    if (verifiedEmail !== dto.email) {
      throw new AppError(
        "Email mismatch",
        400
      );
    }

    const existingUser =
      await this.userRepository.findByEmail(
        dto.email
      );

    if (existingUser) {
      throw new AppError(
        "Email already exists",
        409
      );
    }

    const existingPhone =
      await this.userRepository.findByPhone(
        dto.phone
      );

    if (existingPhone) {
      throw new AppError(
        "Phone already exists",
        409
      );
    }

    const user =
      await prisma.$transaction(
        async (tx) => {

          return tx.user.create({
            data: {
              name: dto.name,
              email: dto.email,
              phone: dto.phone,
              isEmailVerified: true,
            },
          });

        }
      );

    const accessToken =
      this.jwtService.generateAccessToken(
        user.id,
        user.role
      );

    const refreshToken =
      this.jwtService.generateRefreshToken(
        user.id,
        user.role
      );

    const refreshTokenHash =
      sha256(refreshToken);

    const expiry =
      new Date();

    expiry.setDate(
      expiry.getDate() + 30
    );

    await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt: expiry,
    });

    await otpService.deleteVerificationToken(
      dto.verificationToken
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async sendLoginOtp(
    email: string
  ): Promise<void> {

    const user =
      await this.userRepository.findByEmail(
        email
      );

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const otpExpiry =
      await configService.get(
        "OTP_EXPIRY_SECONDS"
      );

    const otp =
      await otpService.generateAndStoreOtp(
        email,
        Number(otpExpiry)
      );

    await emailService.sendOtpEmail(
      email,
      otp
    );
  }

  async verifyLoginOtp(
    email: string,
    otp: string
  ) {

    const valid =
      await otpService.verifyOtp(
        email,
        otp
      );

    if (!valid) {
      throw new AppError(
        "Invalid OTP",
        400
      );
    }

    const user =
      await this.userRepository.findByEmail(
        email
      );

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const accessToken =
      this.jwtService.generateAccessToken(
        user.id,
        user.role
      );

    const refreshToken =
      this.jwtService.generateRefreshToken(
        user.id,
        user.role
      );

    const refreshTokenHash =
      sha256(refreshToken);

    const expiry =
      new Date();

    expiry.setDate(
      expiry.getDate() + 30
    );

    await prisma.$transaction(
      async (tx) => {

        await tx.userSession.create({
          data: {
            userId: user.id,
            refreshTokenHash,
            expiresAt: expiry,
          },
        });

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastLoginAt:
              new Date(),
          },
        });

      }
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    token: string
  ) {

    let payload;

    try {

      payload =
        this.jwtService.verifyRefreshToken(
          token
        );

    } catch {

      throw new AppError(
        "Invalid or expired refresh token",
        401
      );

    }

    const refreshTokenHash =
      sha256(token);

    const session =
      await this.sessionRepository
        .findByRefreshTokenHash(
          refreshTokenHash
        );

    if (!session) {

      throw new AppError(
        "Session not found",
        401
      );

    }

    if (
      session.expiresAt <
      new Date()
    ) {

      throw new AppError(
        "Session expired",
        401
      );

    }

    const user =
      await this.userRepository.findById(
        payload.userId
      );

    if (!user) {

      throw new AppError(
        "User not found",
        404
      );

    }

    if (
      user.status === "BLOCKED"
    ) {

      throw new AppError(
        "User blocked",
        403
      );

    }

    const accessToken =
      this.jwtService.generateAccessToken(
        user.id,
        user.role
      );

    const newRefreshToken =
      this.jwtService.generateRefreshToken(
        user.id,
        user.role
      );

    const newRefreshTokenHash =
      sha256(
        newRefreshToken
      );

    await this.sessionRepository
      .updateRefreshTokenHash(
        session.id,
        newRefreshTokenHash
      );

    return {
      accessToken,
      refreshToken:
        newRefreshToken,
    };
  }

  async logout(
    refreshToken: string
  ): Promise<void> {

    const refreshTokenHash = sha256(refreshToken);

    await this.sessionRepository.deleteByRefreshTokenHash(refreshTokenHash);

  }

  async logoutAll(
    userId: string
  ): Promise<void> {

    await this.sessionRepository.deleteAllByUserId(userId);

  }

  async me(
    userId: string
  ) {

    const user =
      await this.userRepository.findById(
        userId
      );

    if (!user) {

      throw new AppError(
        "User not found",
        404
      );

    }

    return user;
  }
}