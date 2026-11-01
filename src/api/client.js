import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const request = error.config;
    const isAuthRequest =
      request?.url?.startsWith('/auth/login') ||
      request?.url?.startsWith('/auth/register') ||
      request?.url?.startsWith('/auth/refresh');

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      return api(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;
