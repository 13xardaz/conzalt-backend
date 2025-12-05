import { google } from "googleapis";

// ID твоей таблицы Google Sheets
const SPREADSHEET_ID = "1NWfBtepHrj1NGDZcYN3CbzVXAUprUipf2aCtWW9qf30";

// Настройка доступа по API ключу (загрузим позже)
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
});

const sheets = google.sheets({ version: "v4", auth });

// ============================================================
// 📌 Получить вопросы для роли
// ============================================================

export async function loadQuestions(role: string) {
  const range = "questions!A:I";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range
  });

  const rows = res.data.values;
  if (!rows) return [];

  // первая строка — заголовки
  const data = rows.slice(1);

  // фильтруем вопросы под роль
  const questions = data
    .filter((r) => r[0] === role)
    .map((r) => ({
      role_id: r[0],
      block_type: r[1],
      order: Number(r[2]),
      question_text: r[3],
      answer_type: r[4],
      options: r[5] ? r[5].split(";") : [],
      pae_type: r[6],
      scale_min: r[7] ? Number(r[7]) : null,
      scale_max: r[8] ? Number(r[8]) : null
    }))
    .sort((a, b) => a.order - b.order);

  return questions;
}

// ============================================================
// 📌 Записать ответ в таблицу submissions
// ============================================================

export async function saveSubmission({
  submission_id,
  role_id,
  person_name,
  company,
  question_text,
  answer,
  block_type,
  timestamp
}: any) {
  const row = [
    submission_id,
    role_id,
    person_name,
    company,
    question_text,
    answer,
    block_type,
    timestamp
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "submissions!A:H",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] }
  });
}
