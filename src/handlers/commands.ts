import { TelegramMessage as Message } from "@codebam/cf-workers-telegram-bot";
import { Database } from "../utils/db";
import { getGroupIdFromName, sendMessage, tg_preprocess } from "../utils/tgapi";

export class CommandHandler {
  constructor(private db: Database, private token: string) {}

  async sendMessage(chatId: number, text: string, options?: Record<string, any>) {
    return await sendMessage(this.token, chatId, text, options);
  }

  async handleStart(message: Message): Promise<void> {
    const userId = message.from?.id;
    if (!userId) return;
    const helpText = `Subscribe Bot, [source code](https://github.com/lxl66566/telegram-subscribe-bot)

/sub <group> <userid> - 订阅特定用户的消息（使用用户 ID）
/sub <group> /regex/ - 订阅匹配正则表达式的消息
/unsub <sub_id> - 取消指定的订阅
/list - 列出所有订阅及其 ID
/chatid - 可用于获取群组 ID
/start - 显示此帮助信息

其中 <group> 可以是群组链接或群组 ID
`;

    await this.sendMessage(message.from.id, helpText, { disable_web_page_preview: true });
  }

  async handleSubscribe(message: Message): Promise<void> {
    const userId = message.from?.id;
    if (!userId) return;

    const args = message.text?.split(" ").slice(1);
    if (!args || args.length < 2) {
      await this.sendMessage(message.from.id, "请提供正确的参数格式：/sub <group> <rule>");
      return;
    }

    const [groupInput, ...targetParts] = args;
    const target = targetParts.join(" ");

    try {
      const groupNameOrId = tg_preprocess(groupInput);
      const groupId = isNaN(Number(groupNameOrId)) ? await getGroupIdFromName(this.token, groupNameOrId) : parseInt(groupNameOrId);
      if (!groupId) {
        throw new Error(`group \`${groupInput}\` 不合法。`);
      }
      await this.db.addSubscriptionRule(userId, groupId, groupNameOrId, target);
      await this.sendMessage(message.from.id, "订阅成功！");
    } catch (error) {
      await this.sendMessage(message.from.id, `订阅失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async handleUnsubscribe(message: Message): Promise<void> {
    const userId = message.from?.id;
    if (!userId) return;

    const temp = message.text?.split(" ")[1];
    if (!temp) {
      await this.sendMessage(message.from.id, "请提供订阅ID：/unsub <sub_id>");
      return;
    }
    const subscriptionId = +temp;

    try {
      await this.db.removeSubscriptionById(userId, subscriptionId);
      await this.sendMessage(message.from.id, "已成功取消订阅");
    } catch (error) {
      await this.sendMessage(message.from.id, `取消订阅失败：${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async handleList(message: Message): Promise<void> {
    const userId = message.from?.id;
    if (!userId) return;

    const subscriptions = await this.db.getUserSubscriptions(userId);
    if (subscriptions.length === 0) {
      await this.sendMessage(message.from.id, "你还没有任何订阅");
      return;
    }

    const subscriptionList = subscriptions.map((sub) => {
      return `${sub.id} ${sub.group_name || sub.group_id} ${sub.subscribe_rule}`;
    });
    await this.sendMessage(message.from.id, `订阅列表：\nid group rule\n${subscriptionList.join("\n")}`);
  }

  async handleGetGroupId(message: Message): Promise<void> {
    await this.sendMessage(message.from.id, `Chat id: \`${message.chat.id}\``);
  }
}
