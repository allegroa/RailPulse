const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setCreds() {
  const newHash = await bcrypt.hash('noblerail', 10);
  await prisma.user.upsert({
    where: { email: 'herm.white@noblerail.com' },
    update: { password: newHash, role: 'superadmin' },
    create: { email: 'herm.white@noblerail.com', password: newHash, role: 'superadmin', name: 'Herm White' }
  });
  console.log('Credenziali aggiornate per herm.white@noblerail.com');
  await prisma.$disconnect();
}
setCreds().catch(console.error);
