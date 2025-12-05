import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required");
}

export const bot = new Telegraf(BOT_TOKEN);

// --- URL твоего WebApp (ПОКА заглушка, заменим после деплоя Vercel) ---
const WEBAPP_URL = "https://example.com/"; 

// --- /start команда ---
bot.start(async (ctx) => {
  await ctx.reply(
    "Добро пожаловать!\nНажмите кнопку ниже, чтобы начать оценку.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Начать оценку",
              web_app: { url: WEBAPP_URL }
            }
          ]
        ]
      }
    }
  );
});

// --- Обработка ошибок Telegram ---
bot.catch((err) => {
  console.error("Telegram error:", err);
});
