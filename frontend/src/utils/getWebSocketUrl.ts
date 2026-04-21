import { SERVER_PORT } from '@/config/constants';

const getWebSocketUrl = (endpoint: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port ? `:${SERVER_PORT}` : '';
  return `${protocol}//${host}${port}/ws/${endpoint}`;
};

export default getWebSocketUrl;
