import type { CredentialKey, CredentialStore } from "./provider";

export class EnvironmentCredentialStore implements CredentialStore {
  readonly kind = "environment" as const;

  async get(key: CredentialKey): Promise<string | undefined> {
    return process.env[key] || undefined;
  }

  async set(): Promise<void> {
    throw new Error("Environment credentials are read-only at runtime");
  }

  async delete(): Promise<void> {
    throw new Error("Environment credentials are read-only at runtime");
  }
}
