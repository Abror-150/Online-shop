const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const router = express.Router();
const Comment = require("../models/comment")
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, attributes: ["id", "userName", "email"] }, 
        { model: Product, attributes: ["id", "name", "price"] }, 
      ],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});
router.post("/", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: "Ma'lumot notogri kiritilgan" });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const one = await Comment.findByPk(id)
    await one.update(req.body)
    res.send(one)
 
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Izoh o'chirildi" });
    } else {
      res.status(404).json({ error: "Izoh topilmadi" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

module.exports = router;
