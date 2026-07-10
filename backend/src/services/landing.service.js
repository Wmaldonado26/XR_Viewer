const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

class LandingService {
  async getAllCards() {
    return prisma.landingCard.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }

  async createCard(data) {
    return prisma.landingCard.create({
      data: {
        layer: data.layer,
        title: data.title,
        description: data.description,
        imagePath: data.imagePath,
        orderIndex: Number(data.orderIndex) || 0,
      },
    });
  }

  async updateCard(id, data) {
    const cardId = Number(id);
    const existing = await prisma.landingCard.findUnique({ where: { id: cardId } });
    if (!existing) {
      throw new Error("Card not found");
    }

    if (data.imagePath && existing.imagePath && data.imagePath !== existing.imagePath) {
      if (fs.existsSync(existing.imagePath)) {
        fs.unlinkSync(existing.imagePath);
      }
    }

    return prisma.landingCard.update({
      where: { id: cardId },
      data: {
        layer: data.layer ?? existing.layer,
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        imagePath: data.imagePath ?? existing.imagePath,
        orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : existing.orderIndex,
      },
    });
  }

  async deleteCard(id) {
    const cardId = Number(id);
    const existing = await prisma.landingCard.findUnique({ where: { id: cardId } });
    if (existing && existing.imagePath) {
      if (fs.existsSync(existing.imagePath)) {
        fs.unlinkSync(existing.imagePath);
      }
    }
    return prisma.landingCard.delete({
      where: { id: cardId },
    });
  }
}

module.exports = new LandingService();
