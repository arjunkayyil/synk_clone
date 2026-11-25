import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete all tasks with number <= 30 (the default seed tasks)
  const result = await prisma.task.deleteMany({
    where: {
      number: {
        lte: 30,
      },
    },
  });

  console.log(`Deleted ${result.count} default seed tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
