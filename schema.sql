-- 订阅表
CREATE TABLE
  IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- 订阅用户的 Telegram ID
    group_id INTEGER NOT NULL, -- 被监听的群组 ID
    group_name TEXT, -- 被监听的群组名称，可为空
    subscribe_rule TEXT NOT NULL, -- 订阅规则
    created_at INTEGER NOT NULL -- 订阅创建时间
  );

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_group_id ON subscriptions (group_id);