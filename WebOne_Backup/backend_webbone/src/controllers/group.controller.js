const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/** Helper: controllo ambito gruppo */
exports.ensureGroupScope = async(req, groupId)=> {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { error: { status: 404, msg: 'group not found' } };
  if (req.user?.role !== 'admin' && group.clientId !== req.user.clientId) {
    return { error: { status: 403, msg: 'forbidden' } };
  }
  return { group };
}

/**
 * Crea gruppo per un Client.
 * Body: { name, clientId? } — per “cliente” clientId forzato al proprio.
 */
exports.create = async(req, res)=> {
  try {
    const { name, clientId } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name richiesto' });
    const finalClientId = req.user?.role === 'admin' ? Number(clientId) : req.user.clientId;
    if (!finalClientId) return res.status(400).json({ error: 'clientId mancante' });

    const group = await prisma.group.create({
      data: { name, client: { connect: { id: finalClientId } } },
      select: { id: true, name: true, clientId: true },
    });
    return res.status(201).json(group);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Lista gruppi.
 * Query: ?clientId=
 */
exports.list = async(req, res)=> {
  try {
    const qClientId = req.query?.clientId ? Number(req.query.clientId) : undefined;
    const where = req.user?.role === 'admin'
      ? (qClientId ? { clientId: qClientId } : {})
      : { clientId: req.user.clientId };

    const groups = await prisma.group.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { members: { include: { user: true } } },
    });

    const shaped = groups.map(g => ({
      id: g.id,
      name: g.name,
      clientId: g.clientId,
      members: g.members.map(m => ({ id: m.user.id, name: m.user.name, email: m.user.email })),
    }));

    return res.json(shaped);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Aggiunge membri a un gruppo.
 * Body: { userIds: number[] }
 */
exports.addMembers= async(req, res)=> {
  try {
    const groupId = Number(req.params.groupId);
    const { userIds } = req.body || {};
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds deve essere un array non vuoto' });
    }

    const { error } = await exports.ensureGroupScope(req, groupId);
    if (error) return res.status(error.status).json({ error: error.msg });

    // opzionale: verifica che tutti gli utenti appartengano allo stesso client del gruppo
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    if (users.some(u => u.clientId !== group.clientId)) {
      return res.status(400).json({ error: 'tutti gli utenti devono appartenere al client del gruppo' });
    }

    await prisma.$transaction(
      userIds.map(uid =>
        prisma.groupUser.upsert({
          where: { userId_groupId: { userId: uid, groupId } },
          create: { userId: uid, groupId },
          update: {},
        })
      )
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * Rimuove un membro dal gruppo.
 */
exports.removeMember=async(req, res)=> {
  try {
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);

    const { error } = await exports.ensureGroupScope(req, groupId);
    if (error) return res.status(error.status).json({ error: error.msg });

    await prisma.groupUser.delete({
      where: { userId_groupId: { userId, groupId } },
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
