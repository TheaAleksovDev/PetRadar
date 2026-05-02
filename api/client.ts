import Constants from 'expo-constants';
import axios from 'axios';

const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ?? (devHost ? `http://${devHost}:8080` : 'http://localhost:8080');

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (_token) {
    config.headers['Authorization'] = `Bearer ${_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error?.response?.status === 401 || error?.response?.status === 403) && _onUnauthorized) {
      _onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
