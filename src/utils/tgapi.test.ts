import { describe, it, expect } from "vitest";
import { tg_preprocess } from "./tgapi";

describe("extract_part_from_url", () => {
  it("应该从完整的 Telegram URL 中提取群组名称", () => {
    expect(tg_preprocess("https://t.me/groupname")).toBe("groupname");
    expect(tg_preprocess("https://telegram.me/groupname")).toBe("groupname");
  });

  it("应该从带有额外路径的 URL 中提取群组名称", () => {
    expect(tg_preprocess("https://t.me/groupname/123")).toBe("groupname");
    expect(tg_preprocess("https://t.me/groupname/post/123")).toBe("groupname");
  });

  it("应该处理带有查询参数的 URL", () => {
    expect(tg_preprocess("https://t.me/groupname?start=123")).toBe("groupname");
  });

  it("应该将无效的 URL 视为直接的 ID", () => {
    expect(tg_preprocess("invalidurl")).toBe("invalidurl");
    expect(tg_preprocess("-4641383989")).toBe("-4641383989");
    expect(tg_preprocess("")).toBe("");
  });
});
