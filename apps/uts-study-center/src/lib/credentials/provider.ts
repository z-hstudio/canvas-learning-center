export type CredentialKey = "CANVAS_ACCESS_TOKEN" | "DEEPSEEK_API_KEY";

export interface CredentialStore {
  readonly kind: "environment" | "encrypted-local" | "os-keychain";
  get(key: CredentialKey): Promise<string | undefined>;
  set(key: CredentialKey, value: string): Promise<void>;
  delete(key: CredentialKey): Promise<void>;
}

export function maskCredential(value: string): string {
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 3)}${"•".repeat(8)}${value.slice(-3)}`;
}
