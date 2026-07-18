const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
    {
      name: "John Doe",
      email: "john@example.com",
      password: await bcrypt.hash("password123", 12),
      role: "USER",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      password: await bcrypt.hash("password456", 12),
      role: "USER",
    },
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log("✅ Users seeded with hashed passwords");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
