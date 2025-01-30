// request.tsx

import axios from 'axios';
import axiosInstance from './axios';

export enum API_METHOD {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

interface RequestConfig {
  url: string;
  method: API_METHOD;
  params?: Record<string, unknown>;
  data?: string | Record<string, unknown>;
  headers?: Record<string, string>;
  controller?: AbortController;
}

export const request = (config: RequestConfig) => {
  switch (config.method) {
    case API_METHOD.GET:
      return axiosInstance.get(config.url, {
        params: config.params,
        headers: config.headers,
        signal: config.controller?.signal,
      });
    case API_METHOD.POST:
      return axiosInstance.post(config.url, config.data, { headers: config.headers });
    case API_METHOD.PATCH:
      return axiosInstance.patch(config.url, config.data, { headers: config.headers });
    case API_METHOD.PUT:
      return axiosInstance.put(config.url, config.data, { headers: config.headers });
    case API_METHOD.DELETE:
      return axiosInstance.delete(config.url, {
        headers: config.headers,
        data: config.data,
      });
    default:
      throw new Error(`Unsupported request method: ${config.method}`);
  }
};

export const cancelRequest = () => {
  axios.Cancel;
};

export const multipleRequest = (requests: Array<Promise<any>>) => axios.all(requests);
