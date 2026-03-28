import axios from 'axios';

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

const apiClient = axios.create({
  baseURL: 'http://10.198.131.45:8080',
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
