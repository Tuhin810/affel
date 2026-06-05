import { z } from "zod";

export const registerSchema =
  z.object({

    name:
      z.string().min(2),

    email:
      z.string().email(),

    phone:
      z.string().min(10),

    verificationToken:
      z.string(),

  });
