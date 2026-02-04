import api from "./api";

export interface LoginParams {
  name: string;
  email: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  status: boolean;
}

export const authService = {
  login: async (data: LoginParams) => {
    return api.post("/login", data);
  },
  getProfile: async () => {
    return api.get("/profile");
  },
  updateProfile: async (data: Partial<User>) => {
    return api.patch("/update-profile", data);
  },
};
