// 这是一个用于后台管理的 Cloudflare Pages Function
// 它处理获取和更新 KV 数据的请求，并受密码保护

export async function onRequest(context) {
    const { request, env } = context;

    // 从环境变量中获取预设的管理密码
    const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        return new Response("服务器未设置管理密码。", { status: 500 });
    }

    // 从请求头中获取用户输入的密码
    const providedPassword = request.headers.get('Authorization');

    // 验证密码
    if (providedPassword !== ADMIN_PASSWORD) {
        return new Response("密码错误。", { status: 401 });
    }

    const kv = env.KV;
    const key = "linksData";

    // 根据请求方法分别处理
    if (request.method === 'GET') {
        // --- 处理获取数据的请求 ---
        try {
            const linksJson = await kv.get(key);
            if (linksJson === null) {
                // 如果 KV 中没有数据，返回一个空数组，方便前端编辑
                return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
            }
            // 直接返回从 KV 获取的 JSON 字符串
            return new Response(linksJson, { headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            return new Response(`获取数据失败: ${error.message}`, { status: 500 });
        }
    }

    if (request.method === 'POST') {
        // --- 处理保存数据的请求 ---
        try {
            const newData = await request.text();
            // 验证一下是不是合法的 JSON
            JSON.parse(newData); 
            
            // 将新数据存入 KV
            await kv.put(key, newData);
            
            return new Response("数据更新成功！", { status: 200 });
        } catch (error) {
            return new Response(`更新失败，可能是 JSON 格式错误: ${error.message}`, { status: 400 });
        }
    }

    // 如果是其他请求方法，则不允许
    return new Response("方法不被允许。", { status: 405 });
}
