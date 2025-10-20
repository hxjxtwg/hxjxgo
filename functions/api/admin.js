// 这个API现在只负责GET和SET完整的导航数据
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('请求方法必须是 POST', { status: 405 });
  }

  try {
    const { password, action, data } = await request.json();

    const ENV_PASSWORD = env.ADMIN_PASSWORD;
    if (!ENV_PASSWORD) {
      return new Response("服务器错误：未配置 'ADMIN_PASSWORD' 环境变量。", { status: 500 });
    }
    if (password !== ENV_PASSWORD) {
      return new Response("验证失败", { status: 401 });
    }

    const kv = env.KV;
    if (!kv) {
        return new Response("服务器错误：未绑定 KV 命名空间。", { status: 500 });
    }
    
    // key 现在被硬编码为 'navigation_data'
    const key = 'navigation_data';

    if (action === 'GET') {
      const dataJson = await kv.get(key);
      // 如果没有数据，则返回一个空数组
      return new Response(dataJson || JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    } 
    
    else if (action === 'SET') {
      // 将整个导航结构保存为一个JSON字符串
      await kv.put(key, JSON.stringify(data, null, 2));
      return new Response("数据保存成功", { status: 200 });
    } 
    
    else {
      return new Response('无效的操作', { status: 400 });
    }

  } catch (error) {
    return new Response(`服务器内部错误: ${error.message}`, { status: 500 });
  }
}

