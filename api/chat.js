const https = require('node:https');
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status, message) => { if (!res.headersSent) res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify({error:{message}})); };
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return fail(405,'请使用 POST 请求'); }
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return fail(503,'请在 Vercel 环境变量中配置 DEEPSEEK_API_KEY');
  const send = (input) => {
    let data;
    try { data = typeof input === 'string' ? JSON.parse(input) : input; } catch { return fail(400,'无效的 JSON'); }
    if (!Array.isArray(data?.messages) || !data.messages.length || data.messages.length > 60 || data.messages.some(m => !['system','user','assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 8000)) return fail(400,'消息格式无效或内容过长');
    const body = JSON.stringify({model:'deepseek-chat',messages:data.messages,max_tokens:500,stream:false});
    const proxy = https.request({hostname:'api.deepseek.com',path:'/chat/completions',method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key,'Content-Length':Buffer.byteLength(body)}}, upstream => {
      res.writeHead(upstream.statusCode, {'Content-Type':'application/json; charset=utf-8'});
      upstream.pipe(res);
    });
    proxy.setTimeout(55000, () => proxy.destroy(new Error('timeout')));
    proxy.on('error', () => { if (!res.headersSent) fail(502,'AI 服务暂时不可用，请稍后重试'); else res.end(); });
    proxy.end(body);
  };
  if (req.body !== undefined) return send(req.body);
  let body = '';
  let exceeded = false;
  req.on('data', chunk => { if (exceeded) return; body += chunk; if (Buffer.byteLength(body) > 100000) { exceeded = true; fail(413,'请求过大'); } });
  req.on('end', () => { if (!exceeded) send(body); });
};
