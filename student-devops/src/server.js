const http = require('http');
const fs = require('fs');
const path = require('path');

const startedAt = Date.now();
const stats = { requests: 0, errors: 0 };
let students = [{ id: 1, name: 'Asha', course: 'DevOps' }];
let nextId = 2;

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    stats.requests++;
    const url = req.url.split('?')[0];
    try {
      if (url === '/health') {
        return send(res, 200, { status: 'UP', uptime_seconds: Math.floor((Date.now() - startedAt) / 1000) });
      }
      if (url === '/metrics') {
        const m = process.memoryUsage();
        const text =
          `# TYPE app_requests_total counter\napp_requests_total ${stats.requests}\n` +
          `# TYPE app_errors_total counter\napp_errors_total ${stats.errors}\n` +
          `# TYPE app_memory_rss_bytes gauge\napp_memory_rss_bytes ${m.rss}\n` +
          `# TYPE app_students gauge\napp_students ${students.length}\n` +
          `# TYPE app_uptime_seconds gauge\napp_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}\n`;
        return send(res, 200, text, 'text/plain');
      }
      if (url === '/api/students' && req.method === 'GET') return send(res, 200, students);
      if (url === '/api/students' && req.method === 'POST') {
        const { name, course } = await readBody(req);
        if (!name || !course) { stats.errors++; return send(res, 400, { error: 'name and course are required' }); }
        const s = { id: nextId++, name, course };
        students.push(s);
        return send(res, 201, s);
      }
      const m = url.match(/^\/api\/students\/(\d+)$/);
      if (m && req.method === 'DELETE') {
        const id = Number(m[1]);
        const before = students.length;
        students = students.filter(s => s.id !== id);
        if (students.length === before) { stats.errors++; return send(res, 404, { error: 'not found' }); }
        return send(res, 200, { deleted: id });
      }
      if (url === '/' || url === '/index.html') {
        return send(res, 200, fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html')), 'text/html');
      }
      stats.errors++;
      send(res, 404, { error: 'route not found' });
    } catch (e) {
      stats.errors++;
      console.error('ERROR', e.message);
      send(res, 500, { error: 'server error' });
    }
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log(`Student app running on port ${port}`));
}
module.exports = { createServer };
