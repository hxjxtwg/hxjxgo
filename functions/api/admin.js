// 这个API现在可以根据 "key" 参数来获取或保存不同的数据
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('请求方法必须是 POST', { status: 405 });
  }

  try {
    const { password, action, key, data } = await request.json();

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
    if (!key) {
        return new Response('缺少 "key" 参数', { status: 400 });
    }
    
    if (action === 'GET') {
      const dataJson = await kv.get(key);
      const emptyData = key === 'main_nav_config' ? [] : { title: '', groups: [] };
      return new Response(dataJson || JSON.stringify(emptyData), {
        headers: { 'Content-Type': 'application/json' },
      });
    } 
    
    else if (action === 'SET') {
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

