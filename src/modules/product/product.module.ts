import { ProductRepository } from "./repositories/product.repository";
import { ProductService } from "./services/product.service";
import { ProductController } from "./controllers/product.controller";

const productRepository = new ProductRepository();

export const productService = new ProductService(productRepository);

export const productController = new ProductController(productService);
