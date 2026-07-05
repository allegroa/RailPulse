const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { clientId: req.user.clientId },
      select: {
        id: true,
        name: true,
        description: true,
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

exports.createProduct = async (req, res) => {
  const { name, serial, firmware, description } = req.body;

  if (!name || !serial) {
    return res.status(400).json({ message: "Nome e seriale sono obbligatori" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        serial,
        firmware,
        description,
        clientId: req.user.clientId,  // viene dal JWT
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Errore nella creazione prodotto:", error);
    res.status(500).json({ message: 'Errore interno', error: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  const { name, serial, firmware } = req.body;
  const productId = parseInt(req.params.id);

  try {
    // Verifica che il prodotto appartenga al client loggato
    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing || existing.clientId !== req.user.clientId) {
      return res.status(404).json({ message: "Prodotto non trovato" });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { name, serial, firmware }
    });

    res.json(updated);
  } catch (error) {
    console.error("Errore nell'aggiornamento prodotto:", error);
    res.status(500).json({ message: 'Errore interno', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existing || existing.clientId !== req.user.clientId) {
      return res.status(404).json({ message: "Prodotto non trovato" });
    }

    await prisma.product.delete({ where: { id: productId } });

    res.json({ message: "Prodotto eliminato con successo" });
  } catch (error) {
    console.error("Errore nella cancellazione prodotto:", error);
    res.status(500).json({ message: 'Errore interno', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const where = { id };
    if (req.user.role !== 'superadmin') {
      where.clientId = req.user.clientId;
    }

    const product = await prisma.product.findFirst({
      where,
    });

    if (!product) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    res.json(product);
  } catch (error) {
    console.error('Errore getProductById:', error);
    res.status(500).json({ error: 'Errore server' });
  }
};
