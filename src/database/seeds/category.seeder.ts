import prisma from "../../database/prisma/client";
import logger from "../../config/logger";

const initialCategories = [
  "Bill Payments",
  "Watches",
  "Apparel & Accessories",
  "Luxury Beauty",
  "Beauty",
  "Shoes",
  "Books",
  "Toys & Games",
  "Personal Care Appliances",
  "Car & Motorbike",
  "Baby",
  "Health & Beauty",
  "Pet Supplies",
  "Grocery",
  "Musical Instruments & Wireless Accessories",
  "Computers, Electronics & Large Appliances",
  "Sports & Outdoors",
  "Industrial & Scientific",
  "Home",
  "Luggage",
  "Furniture",
  "Home & Garden, Kitchen & Housewares",
  "Bicycles & Gym Equipment, Tires & Rims",
  "Amazon Fresh & Pantry",
  "Cell Phones & Service"
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function seedCategories(): Promise<void> {
  logger.info("Checking if categories need seeding...");
  const count = await prisma.category.count();
  if (count > 0) {
    logger.info("Categories already exist in database. Skipping seeding.");
    return;
  }

  logger.info(`Seeding ${initialCategories.length} categories...`);

  await prisma.$transaction(
    initialCategories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug: slugify(name),
        },
      })
    )
  );

  logger.info("Category seeding completed successfully.");
}
