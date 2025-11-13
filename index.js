import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Root check
app.get("/", (req, res) => {
  res.send("AI Lead Scorer Backend is running 🚀");
});

// Core scoring logic (moved from frontend, simplified)
function scoreLead(usernameRaw) {
  const username = usernameRaw.trim().replace("@", "");
  const clean = username.toLowerCase();

  let buyScore = 5;
  let painPoints = [];
  let buyingSignals = [];
  let techOpenness = "MEDIUM";
  let businessStage = "Established";

  if (clean.includes("real") || clean.includes("property") || clean.includes("estate")) {
    buyScore += 2;
    buyingSignals.push("Real estate focus in username");
  }
  if (clean.includes("dubai") || clean.includes("uae") || clean.includes("dxb")) {
    buyScore += 2;
    buyingSignals.push("Dubai-based agent");
  }
  if (clean.includes("broker") || clean.includes("agent")) {
    buyScore += 1;
    businessStage = "Professional";
  }
  if (clean.includes("luxury") || clean.includes("premium")) {
    buyScore += 1;
    buyingSignals.push("High-ticket sales (can afford premium tools)");
  }
  if (clean.includes("team") ||
