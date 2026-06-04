import { MerchantRepository } from "./merchant/repositories/merchant.repository";
import { MerchantService } from "./merchant/services/merchant.service";
import { MerchantController } from "./merchant/controllers/merchant.controller";

const merchantRepository =
  new MerchantRepository();

export const merchantService =
  new MerchantService(
    merchantRepository
  );

export const merchantController =
  new MerchantController(
    merchantService
  );