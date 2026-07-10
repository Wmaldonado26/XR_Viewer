const landingService = require("../services/landing.service");

class LandingController {
  async getCards(req, res) {
    const cards = await landingService.getAllCards();
    res.json(cards);
  }

  async createCard(req, res) {
    let imagePath = null;
    if (req.files && req.files.image && req.files.image[0]) {
      imagePath = req.files.image[0].path && req.files.image[0].path.startsWith('http') 
        ? req.files.image[0].path 
        : `/uploads/${req.files.image[0].filename}`;
    }

    const data = {
      layer: req.body.layer,
      title: req.body.title,
      description: req.body.description,
      orderIndex: req.body.orderIndex,
      imagePath,
    };

    const newCard = await landingService.createCard(data);
    res.status(201).json(newCard);
  }

  async updateCard(req, res) {
    const { id } = req.params;
    const data = {
      layer: req.body.layer,
      title: req.body.title,
      description: req.body.description,
      orderIndex: req.body.orderIndex,
    };

    if (req.files && req.files.image && req.files.image[0]) {
      data.imagePath = req.files.image[0].path && req.files.image[0].path.startsWith('http') 
        ? req.files.image[0].path 
        : `/uploads/${req.files.image[0].filename}`;
    }

    const updated = await landingService.updateCard(id, data);
    res.json(updated);
  }

  async deleteCard(req, res) {
    const { id } = req.params;
    await landingService.deleteCard(id);
    res.json({ message: "Card deleted successfully" });
  }
}

module.exports = new LandingController();
