import { getAuth, type NoUserInfo, type UserInfo } from "@workos/authkit-tanstack-react-start";
import type { AuthKitProviderProps } from "@workos/authkit-tanstack-react-start/client";

export type WorkosInitialAuth = NonNullable<AuthKitProviderProps["initialAuth"]>;

export const workosClientConfigured =
  typeof import.meta.env.VITE_WORKOS_CLIENT_ID === "string" &&
  import.meta.env.VITE_WORKOS_CLIENT_ID.length > 0;

export function toInitialAuth(auth: UserInfo | NoUserInfo): WorkosInitialAuth {
  if (!auth.user) {
    return { user: null };
  }

  const { accessToken: _accessToken, ...clientAuth } = auth;
  return clientAuth;
}

export async function loadWorkosInitialAuth(): Promise<WorkosInitialAuth | undefined> {
  if (!workosClientConfigured) {
    return undefined;
  }

  const auth = await getAuth();
  return toInitialAuth(auth);
}
