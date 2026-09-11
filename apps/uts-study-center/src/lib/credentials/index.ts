import { EnvironmentCredentialStore } from "./environment-store";
import type { CredentialStore } from "./provider";

let credentialStore: CredentialStore | undefined;

export function getCredentialStore(): CredentialStore {
  credentialStore ??= new EnvironmentCredentialStore();
  return credentialStore;
}

export type { CredentialKey, CredentialStore } from "./provider";
export { maskCredential } from "./provider";
