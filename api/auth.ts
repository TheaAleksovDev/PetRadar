import apiClient from "./client";

export async function signup(name: string, email: string, password: string) {
  const body = { name, username: email, password };
  console.log("[api] signup body →", JSON.stringify(body));
  const { data } = await apiClient.post("/api/auth/signup", body);
  return data as { token?: string };
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post("/api/auth/login", { username: email, password });
  return data as { token: string };
}
