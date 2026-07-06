const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'herm.white@noblerail.com';
  const password = 'noblerail';
  
  await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'superadmin', 
      password: await bcrypt.hash(password, 10),
      clientId: null 
    },
    create: {
      name: 'Herm White',
      email: email,
      password: await bcrypt.hash(password, 10),
      role: 'superadmin',
      clientId: null,
    },
  });

  console.log('✅ Utente creato o aggiornato con successo');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
