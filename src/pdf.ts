import { google } from "googleapis";
import { SubmissionRecord } from "./types";
import { loadQuestions } from "./sheets";
import { v4 as uuid } from "uuid";
import { google as gauth } from "googleapis";
import { PDFDocument } from "pdf-lib";

// =========================
// AUTH Google Drive
// =========================

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
  },
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
});

const drive = google.drive({ version: "v3", auth });

// =========================
// Генерация PDF
// =========================

export async function generatePdfReport(
  submissionId: string,
  answers: SubmissionRecord[]
) {
  // ---- 1. Группируем ответы ----

  const person = answers[0]?.person_name || "Неизвестно";
  const company = answers[0]?.company || "Неизвестно";
  const role = answers[0]?.role_id || "unknown";

  // ---- 2. Считаем PaEi ----
  let P = 0, A = 0, E = 0, I = 0;

  for (const ans of answers) {
    if (ans.block_type === "paei") {
      if (ans.answer === "Да") {
        if (ans.question_text.includes("P")) P++;
        if (ans.question_text.includes("A")) A++;
        if (ans.question_text.includes("E")) E++;
        if (ans.question_text.includes("I")) I++;
      }
    }
  }

  const maxVal = Math.max(P, A, E, I);
  const paeProfile =
    maxVal === P ? "P" : maxVal === A ? "A" : maxVal === E ? "E" : "I";

  // ---- 3. HTML содержимое ----

  const html = `
  <h1>Отчёт по оценке кандидата</h1>
  <p><b>Имя:</b> ${person}</p>
  <p><b>Компания:</b> ${company}</p>
  <p><b>Роль:</b> ${role}</p>

  <h2>PaEi профиль</h2>
  <p>P: ${P}</p>
  <p>A: ${A}</p>
  <p>E: ${E}</p>
  <p>I: ${I}</p>
  <p><b>Тип личности:</b> ${paeProfile}</p>

  <h2>Ответы кандидата</h2>
  ${answers
    .map(
      (a) => `
      <p><b>${a.question_text}</b><br/>Ответ: ${a.answer}</p>
    `
    )
    .join("")}
  `;

  // ---- 4. HTML → PDF через pdf-lib (очень простой вариант) ----

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const fontSize = 12;
  const lines = html
    .replace(/<[^>]+>/g, "") // простое удаление HTML тегов
    .split("\n");

  let y = page.getHeight() - 40;

  lines.forEach((line) => {
    page.drawText(line, { x: 40, y, size: fontSize });
    y -= 16;
  });

  const pdfBytes = await pdfDoc.save();

  // ---- 5. Загружаем PDF на Google Drive ----

  const fileName = `Report_${submissionId}.pdf`;

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/pdf"
    },
    media: {
      mimeType: "application/pdf",
      body: Buffer.from(pdfBytes)
    }
  });

  const fileId = file.data.id;

  // Делаем файл доступным по ссылке
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone"
    }
  });

  const pdfUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return pdfUrl;
}
