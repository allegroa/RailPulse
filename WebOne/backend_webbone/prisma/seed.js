// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const superEmail = process.env.ADMIN_EMAIL || 'super@local';
  const superPass  = process.env.ADMIN_PASSWORD || 'StrongP@ssw0rd';

  // SUPERADMIN senza client
  await prisma.user.upsert({
    where: { email: superEmail },      // email è unique in User
    update: { role: 'superadmin', clientId: null },
    create: {
      name: 'Super Admin',
      email: superEmail,
      password: await bcrypt.hash(superPass, 10),
      role: 'superadmin',
      clientId: null,
    },
  });

  // Client "Root" (find-or-create)
  let root = await prisma.client.findFirst({ where: { name: 'Root' } });
  if (!root) {
    root = await prisma.client.create({
      data: { name: 'Root', contact: 'root@local', folderName: 'root' },
    });
  }

  // Admin del client Root (email unique → qui posso usare upsert)
  await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: { role: 'admin', clientId: root.id },
    create: {
      name: 'Admin Root',
      email: 'admin@local',
      password: await bcrypt.hash('StrongP@ssw0rd', 10),
      role: 'admin',
      clientId: root.id,
    },
  });

  console.log('✅ Seed completata');
}

main().catch(e => { console.error(e); process.exit(1); })
       .finally(async () => prisma.$disconnect());
