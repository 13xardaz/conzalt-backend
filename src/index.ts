import express from "express";
import cors from "cors";
import { bot } from "./telegram";
import { getQuestions } from "./testController";
import { submitAnswer } from "./submitController";
import { buildPdf } from "./pdfController";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------
// Запускаем Telegram Bot
// -------------------------------
bot.launch().then(() => {
  console.log("Telegram bot started");
});

// -------------------------------
// API: Получить вопросы по роли
// -------------------------------
app.get("/api/test", async (req, res) => {
  const role = req.query.role as string;

  if (!role) {
    return res.status(400).json({ error: "role is required" });
  }

  try {
    const questions = await getQuestions(role);
    res.json(questions);
  } catch (e) {
    console.error("Error loading questions:", e);
    res.status(500).json({ error: "failed to load questions" });
  }
});

// -------------------------------
// API: Принять ответ
// -------------------------------
app.post("/api/submit", async (req, res) => {
  try {
    const result = await submitAnswer(req.body);
    res.json({ ok: true, submission_id: result.submission_id });
  } catch (e) {
    console.error("Error saving submission:", e);
    res.status(500).json({ error: "failed to submit answer" });
  }
});

// -------------------------------
// API: Генерация PDF отчёта
// -------------------------------
app.get("/api/pdf/:id", async (req, res) => {
  const submissionId = req.params.id;

  try {
    const pdfUrl = await buildPdf(submissionId);
    res.json({ ok: true, pdf: pdfUrl });
  } catch (e) {
    console.error("Error generating PDF:", e);
    res.status(500).json({ error: "failed to generate PDF" });
  }
});

// -------------------------------
// Запуск сервера
// -------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
