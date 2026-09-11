import { describe, expect, it } from "vitest";
import enAU from "../../messages/en-AU.json";
import zhCN from "../../messages/zh-CN.json";

describe("localization dictionaries", () => {
  it("keeps English and Chinese translation keys in parity", () => {
    expect(flattenKeys(zhCN)).toEqual(flattenKeys(enAU));
  });

  it("does not contain blank translations", () => {
    for (const dictionary of [enAU, zhCN]) {
      expect(flattenValues(dictionary).every((value) => value.trim().length > 0)).toBe(true);
    }
  });
});

function flattenKeys(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof child === "object" && child !== null
        ? flattenKeys(child as Record<string, unknown>, path)
        : [path];
    })
    .sort();
}

function flattenValues(value: Record<string, unknown>): string[] {
  return Object.values(value).flatMap((child) =>
    typeof child === "object" && child !== null
      ? flattenValues(child as Record<string, unknown>)
      : [String(child)],
  );
}
