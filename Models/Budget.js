const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  month: String,
  amount: { type: Number, required: true },
});

module.exports = mongoose.model("Budget", BudgetSchema);
