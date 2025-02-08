import { Database } from "./utils/db";
import { CommandHandler } from "./handlers/commands";
import { MessageHandler } from "./handlers/messages";
import { TelegramMessage } from "@codebam/cf-workers-telegram-bot";

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const db = new Database(env.DB);
    const commandHandler = new CommandHandler(db, env.TELEGRAM_BOT_TOKEN);
    const messageHandler = new MessageHandler(db, env.TELEGRAM_BOT_TOKEN);

    if (request.method === "POST") {
      const update = (await request.json()) as TelegramUpdate;
      const message = update.message;

      if (!message) {
        return new Response("OK");
      }

      // console.log(`get message from: ${message.text}`);

      try {
        // 如果是命令，交给命令处理器处理
        if (message.text?.startsWith("/")) {
          const command = message.text.split(" ")[0];
          switch (command) {
            case "/start":
              await commandHandler.handleStart(message);
              break;
            case "/sub":
              await commandHandler.handleSubscribe(message);
              break;
            case "/unsub":
              await commandHandler.handleUnsubscribe(message);
              break;
            case "/list":
              await commandHandler.handleList(message);
              break;
            case "/chatid":
              await commandHandler.handleGetGroupId(message);
              break;
          }
        } else {
          // 如果不是命令，交给消息处理器处理
          await messageHandler.handleMessage(message);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        if (message.chat.type === "private") {
          await commandHandler.sendMessage(message.chat.id, "处理消息时发生错误，请稍后重试");
        }
      }
    }

    return new Response("OK");
  },
};
