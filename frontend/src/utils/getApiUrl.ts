import { SERVER_PORT } from '@/config/constants';

export const getApiUrl = (endpoint: string) => {
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  const port = window.location.port ? `:${SERVER_PORT}` : '';

  return `${protocol}//${host}${port}/api${endpoint}`;
};
