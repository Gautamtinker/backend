const express = require("express");
const createError = require("http-errors");
const Budget = require("../Models/Budget");
const Transaction = require("../Models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/", async (req, res, next) => {
  try {
    console.log(req);
    const { budgetAmount } = req.body;
    if (!budgetAmount) throw createError(400, "Amount is required");

    // Step 1: Fetch transactions for the user
    const transactions = await Transaction.find({ user: req.user.id });
    if (transactions.length === 0) {
      throw createError(404, "No transactions found for this user");
    }

    // Step 2: Extract month from the first transaction (or you can loop through all)
    const firstTransaction = transactions[0];
    const date = new Date(firstTransaction.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`; // e.g., "2025-05"

    // Step 3: Upsert budget for the extracted month
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month },
      { amount: budgetAmount },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (err) {
    next(err);
  }
});
router.get("/", async (req, res) => {
  const budgets = await Budget.find({ user: req.user.id });
  res.json(budgets);
});

router.get("/summary/:month", async (req, res) => {
  const { month } = req.params;
  const budget = await Budget.findOne({ user: req.user.id, month });
  const start = new Date(`${month}-01`);
  const end = new Date(`${month}-31`);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  });

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    budget: budget ? budget.amount : 0,
    income,
    expense,
    balance: income - expense,
  });
});

module.exports = router;
