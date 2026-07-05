const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { name, email, password, role, clientId } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "Email già registrata" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, clientId }
  });

  res.status(201).json({ message: "Utente registrato con successo", user });
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password errata' });

    // Se ha un clientId, recupera info del client (es. folderName); altrimenti null
    let client = null;
    if (user.clientId != null) {
      client = await prisma.client.findUnique({
        where: { id: user.clientId }, // user.clientId è Int (number)
        select: { folderName: true, id: true, name: true },
      });
    }

    // genera il token includendo anche clientId e folderName (se disponibile)
    const payload = {
      id: user.id,
      role: user.role,
      clientId: user.clientId ?? null,
      folderName: client?.folderName ?? null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clientId: user.clientId ?? null,
        client, // { id, name, folderName } oppure null
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Errore interno' });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    console.error("Errore in getProfile:", error);
    res.status(500).json({ message: 'Errore interno', error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { clientId: req.user.clientId },
      select: {
        id: true,
        name: true,
        serial: true,
        firmware: true
      }
    });

    res.json(products);
  } catch (error) {
    console.error("Errore nel recupero prodotti:", error);
    res.status(500).json({ message: 'Errore interno', error: error.message });
  }
};
