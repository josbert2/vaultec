import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default categories
  const categories = [
    { name: "Social Media", slug: "social-media" },
    { name: "Email", slug: "email" },
    { name: "Banking", slug: "banking" },
    { name: "Shopping", slug: "shopping" },
    { name: "Work", slug: "work" },
    { name: "Entertainment", slug: "entertainment" },
    { name: "Gaming", slug: "gaming" },
    { name: "Education", slug: "education" },
    { name: "Health", slug: "health" },
    { name: "Travel", slug: "travel" },
    { name: "Cloud Storage", slug: "cloud-storage" },
    { name: "Developer", slug: "developer" },
    { name: "Other", slug: "other" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded successfully!");

  const count = await prisma.category.count();
  console.log(`📊 Total categories: ${count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
