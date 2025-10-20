// 这个API现在返回一个包含所有数据的对象
export async function onRequest({ env }) {
  try {
    const kv = env.KV;
    const dataJson = await kv.get('app_data');

    if (dataJson === null) {
      // 如果没有数据，返回一个默认的空结构
      return new Response(JSON.stringify({ navigation: [], search_engines: [] }), {
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

