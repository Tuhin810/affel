import { z } from "zod";

import { uploadFolders } from "./upload.types";

export const generateSignatureSchema =
  z.object({
    folder:
      z.enum(uploadFolders),
  });
