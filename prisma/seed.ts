import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  try {
    // Ensure Prisma is connected
    await prisma.$connect();
    console.log("Connected to database");

    const email = process.env.SEED_ADMIN_EMAIL!;
    const password = process.env.SEED_ADMIN_PASSWORD!;

    if (!email || !password) {
      throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in environment");
    }

    const hashed = await hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: hashed, role: UserRole.MANAGER, name: "Admin" },
    });

    console.log(`Seeded admin user: ${email} (ID: ${user.id})`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    // Always disconnect from Prisma
    await prisma.$disconnect();
    console.log("Disconnected from database");
  }
}

main().catch(e => {
  console.error("Seed script failed:", e);
  process.exit(1);
});
