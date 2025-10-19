import express from "express";
const router = express.Router();

console.log("📞 Incoming USSD Request:");
console.log("Phone:", phoneNumber);
console.log("Text:", text);
console.log("Session:", sessionId);
console.log("Service Code:", serviceCode);

router.post("/", (req, res) => {
  const { text, phoneNumber, sessionId, serviceCode } = req.body;

  let response = "";

  if (text === "") {
    response = "CON Welcome to FarmLink!\n1. Register\n2. View Markets";
  } else if (text === "1") {
    response = "CON Enter your name:";
  } else if (text.startsWith("1*")) {
    const name = text.split("*")[1];
    response = `END Thank you ${name}, registration successful!`;
  } else if (text === "2") {
    response = "END Market prices coming soon!";
  } else {
    response = "END Invalid choice.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

export default router;
