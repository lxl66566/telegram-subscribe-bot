export interface Subscription {
  id: number;
  user_id: number;
  group_id: number;
  group_name?: string;
  subscribe_rule: string;
  created_at: string;
}

export class Database {
  constructor(private db: D1Database) {}

  // 添加订阅规则
  async addSubscriptionRule(userId: number, groupId: number, groupName: string | null, subscribeRule: string): Promise<void> {
    const createdAt = Date.now();
    await this.db
      .prepare(
        `
      INSERT INTO subscriptions (user_id, group_id, group_name, subscribe_rule, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .bind(userId, groupId, groupName, subscribeRule, createdAt)
      .run();
  }

  // 获取属于某个用户的所有订阅规则
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM subscriptions WHERE user_id = ?
    `,
      )
      .bind(userId)
      .all();
    return result.results as unknown as Subscription[];
  }

  // 获取某个群组的所有订阅规则
  async getGroupSubscriptions(groupId: number): Promise<Subscription[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM subscriptions WHERE group_id = ?
    `,
      )
      .bind(groupId)
      .all();
    return result.results as unknown as Subscription[];
  }

  // 通过 ID 删除订阅规则，确保只能删除属于该用户的订阅
  async removeSubscriptionById(userId: number, subscriptionId: number): Promise<void> {
    await this.db
      .prepare(
        `
      DELETE FROM subscriptions 
      WHERE id = ? AND user_id = ?
    `,
      )
      .bind(subscriptionId, userId)
      .run();
  }
}
