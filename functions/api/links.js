// 这是一个 Cloudflare Pages Function.
// 它的作用是作为一个 API 接口，安全地从 KV 空间获取数据。

export async function onRequest(context) {
  try {
    // 1. 获取 KV 命名空间绑定。'MY_LINKS_KV' 这个名字
    //    必须与您在 Cloudflare Pages 后台设置的变量名完全一致。
    const kv = context.env.MY_LINKS_KV;

    // 2. 使用 'linksData' 这个键从 KV 中获取链接数据。
    const linksJson = await kv.get("linksData");

    if (linksJson === null) {
      // 如果键不存在，返回 404 错误。
      return new Response("在 KV 中未找到链接数据。", { status: 404 });
    }

    // 3. 将从 KV 获取的 JSON 字符串解析为对象。
    const linksData = JSON.parse(linksJson);

    // 4. 将数据作为 JSON 响应返回。
    //    'Content-Type' 头对于浏览器正确解析响应至关重要。
    return new Response(JSON.stringify(linksData, null, 2), {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });

  } catch (error) {
    // 如果发生任何其他错误，返回 500 服务器错误。
    return new Response(`获取链接失败: ${error.message}`, { status: 500 });
  }
}

