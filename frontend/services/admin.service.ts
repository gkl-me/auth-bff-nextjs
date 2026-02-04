import api from "./api";

export const adminService = {
  getUsers: async () => {
    return api.get("/admin/users");
  },
  toggleUserStatus: async (userId: string) => {
    return api.patch(`/admin/user-status/${userId}`);
  },
};
