import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const getTranslation = (lang: string, input: string) => {
  return axios.post(`${BASE_URL}/get`, { lang, input })
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching translation", error);
      throw error;
    });
};

export { getTranslation };