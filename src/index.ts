import express from "express";
import cors from "cors";
import { bot } from "./telegram";
import { getQuestions } from "./testController";
import { submitAnswer } from "./submitController";

const app = express();
app.use(cors());
app.use(express.json());

// --- Telegram bot запуск ---
bot.launch().then(() => {
  console.log("Telegram bot started");
});

// --- API: Получить вопросы по роли ---
app.get("/api/test", async (req, res) => {
  const role = req.query.role as string;
  if (!role) return res.status(400).json({ error: "role is required" });

  const questions = await getQuestions(role);
  res.json(questions);
});

// --- API: Принять ответ ---
app.post("/api/submit", async (req, res) => {
  try {
    await submitAnswer(req.body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to submit" });
  }
});

// --- Заглушка PDF (позже добавим) ---
app.get("/api/pdf/:id", (req, res) => {
  res.json({ status: "PDF not implemented yet" });
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
