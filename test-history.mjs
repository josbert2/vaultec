import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testHistory() {
  console.log("🧪 Testing Password History...\n");

  try {
    // 1. Verificar que exista la tabla
    const historyCount = await prisma.passwordHistory.count();
    console.log("✅ PasswordHistory table exists");
    console.log(`📊 Current history entries: ${historyCount}\n`);

    // 2. Verificar que exista el enum
    const enums = await prisma.$queryRaw`
      SHOW COLUMNS FROM PasswordHistory WHERE Field = 'changeType'
    `;
    console.log("✅ ChangeType enum exists");
    console.log("📋 Enum values:", enums[0].Type, "\n");

    // 3. Verificar passwords existentes
    const passwordCount = await prisma.password.count();
    console.log(`📊 Total passwords: ${passwordCount}\n`);

    if (passwordCount > 0) {
      const samplePassword = await prisma.password.findFirst({
        include: {
          history: true,
        },
      });
      
      console.log("📝 Sample password:");
      console.log(`  - ID: ${samplePassword.id}`);
      console.log(`  - Website: ${samplePassword.websiteName}`);
      console.log(`  - History entries: ${samplePassword.history.length}`);
      
      if (samplePassword.history.length > 0) {
        console.log("\n📚 History:");
        samplePassword.history.forEach((entry, i) => {
          console.log(`  ${i + 1}. ${entry.changeType} - ${entry.changedAt}`);
        });
      }
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testHistory();
