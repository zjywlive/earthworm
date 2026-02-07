// 本地版认证 stub - 始终认为用户已登录

export async function setupAuth() {
  // no-op
}

export async function signIn(_callback?: string) {
  // no-op
}

export function signOut() {
  // no-op
}

export function isAuthenticated() {
  return true;
}

export async function getToken() {
  return "local-token";
}

export function fetchUserInfo() {
  return Promise.resolve({
    sub: "local-user",
    name: "本地用户",
    picture: "",
  });
}

export function getSignInCallback() {
  return "/";
}
