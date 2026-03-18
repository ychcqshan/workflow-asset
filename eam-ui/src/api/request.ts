import axios from 'axios';

const request = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || '/api',
    timeout: 10000,
});

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('eam_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        const { responseType } = response.config;
        if (responseType === 'blob' || responseType === 'arraybuffer' || responseType === 'text') {
            return { data: response.data };
        }

        const res = response.data;
        if (res.code !== 200) {
            // Handle business error
            console.error(res.msg);
            return Promise.reject(new Error(res.msg || 'Error'));
        }
        return res;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('eam_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default request;
