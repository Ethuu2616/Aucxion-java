import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
});

export const scanApi = {
  start:   () => api.post('/scan/start'),
  stop:    () => api.post('/scan/stop'),
  results: () => api.get('/scan/results'),
  status:  () => api.get('/scan/status'),
};

export const threatApi = {
  getAll:          () => api.get('/threats'),
  getById:         (id) => api.get(`/threats/${id}`),
  getByType:       (type) => api.get(`/threats/type/${type}`),
  getSuggestions:  (type) => api.get(`/threats/suggestions/${type}`),
  getAllSuggestions:() => api.get('/threats/suggestions'),
  resolve:         (id) => api.put(`/threats/${id}/resolve`),
  clear:           () => api.delete('/threats/clear'),
};

export const portApi = {
  getAll:  () => api.get('/ports'),
  getOpen: () => api.get('/ports/open'),
  scan:    () => api.post('/ports/scan'),
};

export default api;
