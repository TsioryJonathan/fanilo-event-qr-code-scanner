import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping seed");
    return;
  }

  const hashedPassword = hashSync(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { hashedPassword, name },
    create: { email, name, hashedPassword },
  });

  console.log(`Admin user ensured: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
