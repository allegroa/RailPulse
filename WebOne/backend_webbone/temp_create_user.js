const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'herm.white@noblerail.com';
  const password = 'noblerail';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('User already exists, updating password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'ADMIN' }
    });
    console.log('Password updated successfully.');
  } else {
    console.log('User not found, creating new user...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Herm White',
        role: 'ADMIN'
      }
    });
    console.log('User created successfully.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
