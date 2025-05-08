const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db.js");

const authRoutes = require("./routes/auths.js");
const transactionRoutes = require("./routes/Transactions.js");
const budgetRoutes = require("./routes/budget");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

connectDB();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
