const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMetrics = async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    const clientsCount = await prisma.client.count();
    const productsCount = await prisma.product.count();
    const groupsCount = await prisma.group.count();

    res.json({ users: usersCount, clients: clientsCount, products: productsCount, groups: groupsCount });
  } catch (err) {
    console.error('getMetrics error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};
