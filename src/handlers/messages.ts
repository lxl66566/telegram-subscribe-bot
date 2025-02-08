import { TelegramMessage as Message } from "@codebam/cf-workers-telegram-bot";
import { Database } from "../utils/db";
import { getMessageLink, sendMessage } from "../utils/tgapi";

export class MessageHandler {
  constructor(private db: Database, private token: string) {}

  private async sendMessage(chatId: number, text: string, options?: Record<string, any>) {
    return await sendMessage(this.token, chatId, text, options);
  }

  private getMessageLink(chat_id: string, message_id: number): string {
    return getMessageLink(chat_id, message_id);
  }

  /**
   * 已经匹配上的情况下，发送提醒
   */
  private async notifySubscriber(userId: number, message: Message, chat_id: number, rule: string) {
    const messageLink = this.getMessageLink(chat_id.toString(), message.message_id);

    let notificationText = `*${message.chat.title ?? message.chat.id}* 有匹配消息，[点击查看](${messageLink})。\n匹配规则：\`${rule}\`\n\n`;
    if (message.text) {
      notificationText += `${message.text}`;
    } else if (message.caption) {
      notificationText += `${message.caption}`;
    } else {
      notificationText += "[非文本消息]";
    }
    await this.sendMessage(userId, notificationText);
  }

  async handleMessage(message: Message): Promise<void> {
    // 忽略私聊消息
    if (!message.chat?.id || message.chat.type === "private") {
      return;
    }

    // 获取该群组的所有订阅
    const subscriptions = await this.db.getGroupSubscriptions(message.chat.id);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    for (const sub of subscriptions) {
      let shouldNotify = false;

      // 检查正则表达式订阅
      if (sub.subscribe_rule.startsWith("/") && sub.subscribe_rule.endsWith("/")) {
        const regex = new RegExp(sub.subscribe_rule.slice(1, -1));
        const text = message.text || message.caption || "";
        shouldNotify = regex.test(text);
      }
      // 检查用户订阅
      else {
        if (message.from.id.toString() == sub.subscribe_rule) shouldNotify = true;
      }
      if (shouldNotify) {
        await this.notifySubscriber(sub.user_id, message, sub.group_id, sub.subscribe_rule);
      }
    }
  }
}
