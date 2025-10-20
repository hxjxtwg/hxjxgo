// 这个API现在只负责返回完整的导航数据
export async function onRequest({ env }) {
  try {
    const kv = env.KV;
    const dataJson = await kv.get('navigation_data');

    if (dataJson === null) {
      // 如果没有数据，返回一个空数组
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(dataJson, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(`服务器内部错误: ${error.message}`, { status: 500 });
  }
}

