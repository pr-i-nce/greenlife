import axios from 'axios';
import Swal from 'sweetalert2';
import { store } from './store/store';
import { clearAuth } from './store/authSlice';

export const BASE_URL = 'https://jituze.greenlife.co.ke/rest';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isAlertShown = false;

// Handle expired tokens (status 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      store.dispatch(clearAuth());
      
      if (!isAlertShown) {
        isAlertShown = true;
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          icon: 'warning',
          confirmButtonText: 'Login'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/'; 
          }
          isAlertShown = false; 
        });
      }
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
