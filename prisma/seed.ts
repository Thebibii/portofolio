const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

/**
 * Seed aman: TIDAK lagi membuat akun demo dengan password default.
 * Akun admin hanya dibuat bila ADMIN_EMAIL & ADMIN_PASSWORD diset eksplisit.
 *
 * Pemakaian:
 *   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="password-panjang" npx prisma db seed
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "ℹ️  Seed dilewati: set ADMIN_EMAIL dan ADMIN_PASSWORD bila memang ingin membuat/mengubah akun admin."
    );
    return;
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD minimal 12 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Ganti password + naikkan tokenVersion agar sesi lama langsung tidak valid.
    await prisma.user.update({
      where: { email },
      data: {
        password: passwordHash,
        role: "ADMIN",
        tokenVersion: { increment: 1 },
      },
    });
    console.log(`✅ Password admin diperbarui: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin dibuat: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
