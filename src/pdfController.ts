import { google } from "googleapis";
import { generatePdfReport } from "./pdf";

const SPREADSHEET_ID = "1NWfBtepHrj1NGDZcYN3CbzVXAUprUipf2aCtWW9qf30";

// Google Auth (тот же, что в sheets.ts)
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

const sheets = google.sheets({ version: "v4", auth });

// =======================================================
// 📌 Загрузить ВСЕ ответы конкретного submission_id
// =======================================================

async function loadAnswers(submissionId: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "submissions!A:H"
  });

  const rows = res.data.values;
  if (!rows) return [];

  const data = rows.slice(1); // убираем заголовки

  return data
    .filter((r) => r[0] === submissionId)
    .map((r) => ({
      submission_id: r[0],
      role_id: r[1],
      person_name: r[2],
      company: r[3],
      question_text: r[4],
      answer: r[5],
      block_type: r[6],
      timestamp: r[7]
    }));
}

// =======================================================
// 📌 API контроллер: сгенерировать PDF и вернуть ссылку
// =======================================================

export async function buildPdf(submissionId: string) {
  const answers = await loadAnswers(submissionId);

  if (answers.length === 0) {
    throw new Error("Нет данных по submissionId: " + submissionId);
  }

  const pdfUrl = await generatePdfReport(submissionId, answers);
  return pdfUrl;
}
