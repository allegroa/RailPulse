const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setPwd() {
    const email = 'herm.white@noblerail.com';
    const pwd = 'noblerail';
    const newHash = await bcrypt.hash(pwd, 10);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        await prisma.user.update({ where: { email }, data: { password: newHash } });
        console.log('Password updated for ' + email);
    } else {
        console.log('User not found!');
    }
    await prisma.$disconnect();
}
setPwd().catch(console.error);
