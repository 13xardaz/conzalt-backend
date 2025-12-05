import { loadQuestions } from "./sheets";

export async function getQuestions(role: string) {
  try {
    const questions = await loadQuestions(role);
    return questions;
  } catch (err) {
    console.error("Ошибка загрузки вопросов:", err);
    return [];
  }
}
