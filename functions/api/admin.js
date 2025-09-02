// 后台管理接口 (生产版)
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('无效的请求方法', { status: 405 });
  }

  try {
    const { password, action, data } = await request.json();

    // 从环境变量中获取密码
    const ENV_PASSWORD = env.ADMIN_PASSWORD;

    // 检查服务器配置
    if (!ENV_PASSWORD) {
      return new Response('服务器配置错误', { status: 500 });
    }

    // 验证密码
    if (password !== ENV_PASSWORD) {
      return new Response('密码错误', { status: 401 });
    }
    
    // 验证通过，获取 KV 命名空间
    const kv = env.KV;
    if (!kv) {
        return new Response('服务器配置错误', { status: 500 });
    }
    
    // 根据 action 执行操作
    if (action === 'GET') {
      const linksJson = await kv.get("linksData") || '[]';
      return new Response(linksJson, {
        headers: { 'Content-Type': 'application/json' },
      });
    } 
    
    else if (action === 'SET') {
      await kv.put("linksData", JSON.stringify(data, null, 2));
      return new Response("数据保存成功", { status: 200 });
    } 
    
    else {
      return new Response('无效的操作', { status: 400 });
    }

  } catch (error) {
    return new Response('服务器内部错误', { status: 500 });
  }
}

