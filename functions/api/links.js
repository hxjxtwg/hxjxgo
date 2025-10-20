// 这个API现在可以根据 "cat" 参数返回主导航配置或特定分类的链接数据
export async function onRequest({ request, env }) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('cat');

    if (!category) {
      return new Response('缺少 "cat" 参数', { status: 400 });
    }

    const kv = env.KV;
    // 如果请求的是主导航配置，则使用固定的键 'main_nav_config'
    const key = category === 'main_nav_config' ? 'main_nav_config' : category;
    
    const dataJson = await kv.get(key);

    if (dataJson === null) {
      const emptyData = key === 'main_nav_config' ? [] : { title: category, groups: [] };
      return new Response(JSON.stringify(emptyData), {
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

