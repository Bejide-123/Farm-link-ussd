import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import ussdRoute from "./routes/ussd.js";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/ussd", ussdRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
export default app;     
