const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  try {
    const { name, contact, folderName } = req.body;
    const client = await prisma.client.create({ data: { name, contact, folderName } });
    res.status(201).json(client);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot create client' });
  }
};

exports.list = async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot list clients' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot delete client' });
  }
};
