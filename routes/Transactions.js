const express = require("express");
const createError = require("http-errors");
const Transaction = require("../Models/Transaction");
const auth = require("../middleware/auth");
const Budget = require("../Models/Budget");

const router = express.Router();

router.use(auth);

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const { type, amount, category, note, date } = req.body;
    console.log("ddn");
    if (!type || !amount || !category) throw createError(400, "Missing fields");
    console.log("ddn");
    console.log(req.user.id);
    const tx = new Transaction({
      user: req.user.id,
      type,
      amount,
      category,
      note,
      date,
    });
    console.log("ddn");
    await tx.save();
    res.status(201).json(tx);
  } catch (error) {
    console.error("Error saving transaction:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
    // next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const filters = { user: req.user.id };

    if (req.query.category) filters.category = req.query.category;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.startDate && req.query.endDate) {
      filters.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const txs = await Transaction.find(filters);

    res.json(txs);
  } catch (error) {
    next(error);
  }
});

router.get("/budget-summary", async (req, res, next) => {
  try {
    console.log("edmekd");
    const userId = req.user.id;
    console.log(userId);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    console.log(userId);
    const transactions = await Transaction.find({
      user: userId,
      type: "expense",
      date: { $gte: start, $lte: end },
    });

    console.log(userId);

    const expense = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const budget = await Budget.findOne({ user: userId });
    console.log(userId);
    res.json({
      budget: budget?.amount || 0,
      expense,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
