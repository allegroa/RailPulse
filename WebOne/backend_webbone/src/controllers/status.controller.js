const { PrismaClient } = require('@prisma/client');
const http = require('http');
const prisma = new PrismaClient();

exports.getSystemStatus = async (req, res) => {
  try {
    const status = {
      services: {
        backend: { status: 'offline' },
        database: { status: 'offline' },
        genConfig: { status: 'offline' }
      },
      stats: {
        totalUsers: 0,
        usersThisMonth: 0,
        usersThisYear: 0,
        totalClients: 0
      }
    };

    // 1. Backend WebOne is online if we are here
    status.services.backend.status = 'online';

    // 2. Database Status & Stats
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.services.database.status = 'online';

      // Stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      status.stats.totalUsers = await prisma.user.count();
      status.stats.usersThisMonth = await prisma.user.count({
        where: { createdAt: { gte: startOfMonth } }
      });
      status.stats.usersThisYear = await prisma.user.count({
        where: { createdAt: { gte: startOfYear } }
      });
      status.stats.totalClients = await prisma.client.count();

    } catch (dbError) {
      console.error('Database connection error:', dbError);
    }

    // 3. General Configuration Server Status
    const checkGenConfig = () => {
      return new Promise((resolve) => {
        const request = http.get('http://localhost:5002/api/config', (response) => {
          if (response.statusCode === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        request.on('error', () => resolve(false));
        request.setTimeout(3000, () => {
          request.abort();
          resolve(false);
        });
      });
    };

    const isGenConfigOnline = await checkGenConfig();
    if (isGenConfigOnline) {
      status.services.genConfig.status = 'online';
    }

    res.json(status);

  } catch (err) {
    console.error('Error fetching system status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
