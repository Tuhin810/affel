import { MerchantRepository } from "./repositories/merchant.repository";
import { MerchantService } from "./services/merchant.service";
import { MerchantController } from "./controllers/merchant.controller";

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