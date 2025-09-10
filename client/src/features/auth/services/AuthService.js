import { API_ENDPOINTS } from "@/constants/endpoints";
import apiClient from "@/config/axiosCustomer";
const { AUTH } = API_ENDPOINTS;

export const register = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { url, method } = AUTH.register();
      const res = await apiClient({ url: url, method, data: payload });
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
};
