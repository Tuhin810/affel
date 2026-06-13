import { BannerRepository } from "./repositories/banner.repository";
import { BannerService } from "./services/banner.service";
import { BannerController } from "./controllers/banner.controller";

const bannerRepository = new BannerRepository();

export const bannerService = new BannerService(bannerRepository);

export const bannerController = new BannerController(bannerService);
