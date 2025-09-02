// 这是一个带有调试功能的 Cloudflare Pages Function.
export async function onRequest({ request, env }) {
  // 1. 检查请求方法是否为 POST
  if (request.method !== 'POST') {
    return new Response('请求方法必须是 POST', { status: 405 });
  }

  try {
    const { password, action, data } = await request.json();

    // 2. 从 Cloudflare 的环境变量中获取您设置的密码
    const ENV_PASSWORD = env.ADMIN_PASSWORD;

    // --- 调试关键点 1 ---
    // 检查环境变量是否被成功读取
    if (!ENV_PASSWORD) {
      // 如果您看到这个错误，说明 Cloudflare Pages 没有找到名为 ADMIN_PASSWORD 的环境变量。
      // 请检查变量名是否完全正确（全大写），以及是否为“生产”环境设置。
      return new Response("服务器错误：未在环境变量中找到 'ADMIN_PASSWORD'。", { status: 500 });
    }

    // --- 调试关键点 2 ---
    // 对比从前端发送过来的密码和环境变量中的密码
    if (password !== ENV_PASSWORD) {
      // 如果您看到这个错误，说明环境变量已找到，但您输入的密码与设置的密码不匹配。
      // 这可能是因为您忘记了密码，或者在设置时有看不见的空格。
      // 建议您去后台重新编辑并保存一次密码。
      return new Response("验证失败：输入的密码与服务器设置的密码不匹配。", { status: 401 });
    }

    // --- 密码验证通过后的逻辑 ---

    // 获取 KV 命名空间
    const kv = env.KV;
    if (!kv) {
        return new Response("服务器错误：未在后台绑定 KV 命名空间。", { status: 500 });
    }
    
    // 根据 action 执行不同操作
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
    return new Response(`服务器内部错误: ${error.message}`, { status: 500 });
  }
}

