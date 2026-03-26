import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://10.198.131.45:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
