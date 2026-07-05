const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Cancella un utente (solo admin/superadmin)
exports.deleteUser = async (req, res) => {
  try {
    const clientId = req.scopeClientId;
    const { id } = req.params;
    // assicurati che l'utente target sia dello stesso client
    const target = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!target || (clientId && target.clientId !== clientId)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    await prisma.user.delete({ where: { id: target.id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot delete user' });
  }
};
// Reset password di un utente (solo admin/superadmin)
exports.resetPassword = async (req, res) => {
  try {
    const clientId = req.scopeClientId;
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password non valida (min 6 caratteri)' });
    }
    // assicurati che l'utente target sia dello stesso client
    const target = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!target || (clientId && target.clientId !== clientId)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: target.id },
      data: { password: hash }
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot reset password' });
  }
};


exports.create = async (req, res) => {
  try {
    // forza il clientId del creatore admin
    //const clientId = req.scopeClientId; // messo dal middleware
    if (req.scopeRole === 'superadmin') {
      req.clientId = req.body.clientId; // può specificare qualsiasi client
    } else {
      req.body.clientId = req.scopeClientId; // forza il clientId del creatore admin
    }
    const { name, email, password, role = 'cliente', clientId } = req.body;

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, role, clientId }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot create user' });
  }
};

exports.list = async (req, res) => {
  try {
    const clientId = req.scopeClientId;
    const where = clientId ? { clientId } : {};
    const users = await prisma.user.findMany({ where, include: { client: true } });
    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(sanitizedUsers);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot list users' });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const clientId = req.scopeClientId;
    const { id } = req.params;
    const { role } = req.body;

    // assicurati che l'utente target sia dello stesso client
    const target = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!target || target.clientId !== clientId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { role }
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'cannot change role' });
  }
};

