import telegramifyMarkdown from "telegramify-markdown";

/**
 * 接受 id 与 url，返回提取的 id
 * @param input id 或 url
 * @returns
 */
function tg_preprocess(input: string): string {
  try {
    return new URL(input).pathname.split("/")[1];
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return input;
  }
}

/**
 * 制造消息链接
 * @param groupInfo 可以是群组名字或 id
 * @param messageId
 * @returns
 */
function getMessageLink(groupInfo: string, messageId: number) {
  return isNaN(Number(groupInfo)) ? `https://t.me/${groupInfo}/${messageId}` : `https://t.me/c/${parseInt(groupInfo.replace(/^-100/, ""))}/${messageId}`;
}

async function sendMessage(bot_token: string, chatId: number, text: string, options?: Record<string, any>) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramifyMarkdown(text, "escape"),
        parse_mode: options?.parse_mode || "MarkdownV2",
        ...options,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

interface GetGroupResponse {
  ok: boolean;
  result: {
    id: number;
    title: string;
    // 其他可能的字段可以在这里添加
  };
}

async function getGroupIdFromName(bot_token: string, input: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${bot_token}/getChat?chat_id=@${input}`);
    const data: GetGroupResponse = await response.json(); // 使用接口类型

    if (data.ok) {
      console.log(`get id of group ${input}: ${data.result.id}`);
      return data.result.id;
    } else {
      console.error(`Error fetching group ID.`);
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export { tg_preprocess, getMessageLink, sendMessage, getGroupIdFromName };
