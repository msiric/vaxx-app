import { ax } from "../Interceptor.js";

export const postLogin = {
  request: async ({ data }) => await ax.post("/api/auth/login", data),
  success: { message: "User successfully logged in", variant: "success" },
  error: { message: "Failed to log in user", variant: "error" },
};
export const postSignup = {
  request: async ({ data }) => await ax.post("/api/auth/signup", data),
  success: { message: "User successfully signed up", variant: "success" },
  error: { message: "Failed to sign up user", variant: "error" },
};
export const postLogout = {
  request: async () =>
    await ax.post("/api/auth/logout", {
      headers: {
        credentials: "include",
      },
    }),
  success: { message: "User successfully logged out", variant: "success" },
  error: { message: "Failed to log out user", variant: "error" },
};
