import { onRequest } from './functions/api/[[catchall]].js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // /api/* 轉發給 API handler
    if (url.pathname.startsWith('/api')) {
      return onRequest({ request, env, ctx });
    }

    // 靜態資源由 Cloudflare Assets 提供
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
