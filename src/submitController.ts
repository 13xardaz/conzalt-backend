import { saveSubmission } from "./sheets";
import { v4 as uuid } from "uuid";

// Функция обрабатывает одно сохранение ответа
export async function submitAnswer(body: any) {
  const submission_id = body.submission_id || uuid(); // если нет — создать новый

  const record = {
    submission_id,
    role_id: body.role_id,
    person_name: body.person_name,
    company: body.company,
    question_text: body.question_text,
    answer: body.answer,
    block_type: body.block_type,
    timestamp: new Date().toISOString()
  };

  await saveSubmission(record);

  return { submission_id };
}
