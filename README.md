# Telegram Subscribe Bot on Cloudflare Workers

**Subscribe is all you need!**

一个使用 Cloudflare Workers 和 D1 数据库构建的 Telegram 群组消息订阅机器人。可以**订阅群组中的特定用户消息，或任何匹配给定正则表达式的消息**。无需服务器，免费，稳定。

demo: [@atri_subscribe_bot](https://t.me/atri_subscribe_bot)

## 功能

- 订阅群组中特定用户的所有消息
- 订阅群组中与正则表达式匹配的消息
- 支持多用户

## 命令列表

- `/sub <group> <userid>` - 订阅用户的消息（使用用户 ID）
- `/sub <group> /regex/` - 订阅匹配正则表达式的消息
- `/list` - 列出所有订阅
- `/unsub <sub_id>` - 取消指定的订阅
- `/start` - 查看帮助信息
- `/chatid` - 在群组中使用，用于获取群组 id

其中，`<group>` 可以是群组链接或群组 ID，但是（出于 telegram bot api 的限制，）`<userid>` 只能是 user id。

## 部署说明

1. 前置步骤：
   - 注册 Cloudflare 账号
   - 从 [Telegram](https://t.me/botfather) 注册 bot，获取 bot token
   - 确保 bot 已关闭隐私模式：在 botfather 中，对你的 bot 进行 _Bot Settings - Group Privacy - Turn off_。
2. 克隆仓库
   ```sh
   git clone https://github.com/lxl66566/telegram-subscribe-bot.git
   cd telegram-subscribe-bot
   ```
3. 安装项目依赖
   ```sh
   pnpm i
   pnpm i wrangler -g
   ```
4. 部署项目
   ```sh
   wrangler d1 create telegram_subscribe_bot                                  # 创建 d1 数据库
   # 然后将返回的 d1 database 信息填入 wrangler.toml 的 [[d1_databases]] 中
   wrangler d1 execute telegram_subscribe_bot --file=./schema.sql --remote    # 创建数据表
   wrangler deploy                                                            # 部署项目
   wrangler secret put TELEGRAM_BOT_TOKEN                                     # 设置 bot token
   ```
5. 设置 Webhook
   访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>` 设置 webhook。
   `YOUR_WORKER_URL` 在 deploy 时会给出，也可以去 Cloudflare Dashboard 查看。
6. 将 bot 添加到群组中，在私聊中使用 `/start` 命令查看帮助，开始订阅你感兴趣的内容！

## 注意事项

1. 群组 ID 可以通过第三方 Telegram 客户端获取，或将本 bot 添加到群组后，在群组中用 `/chatid` 指令获取。
2. 获取他人的 user id 会麻烦一点，因为 telegram api 并不支持。你可能需要：desktop: [AyuGram](https://github.com/AyuGram/AyuGramDesktop), Android: [TG UserID Viewer](https://github.com/Xposed-Modules-Repo/com.alex193a.tguseridviewer) / [Nagram](https://github.com/NextAlone/Nagram)，或者其他类似工具。（欢迎补充）
3. 如果群组是非公开群组，提醒消息的链接将无法直接跳转。
4. 正则表达式订阅仅匹配消息文本，不匹配其他类型的消息（如图片、视频等）。
5. 为了保护用户隐私，所有通知都通过私聊发送。本 bot **保证**不会在群组中发送任何消息。
