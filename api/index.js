import server from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const url = new URL(req.url, `${protocol}://${req.headers.host}`);
    
    const init = {
      method: req.method,
      headers: req.headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        init.body = JSON.stringify(req.body);
      } else {
        init.body = req.body;
      }
    }
    
    const request = new Request(url, init);
    const response = await server.fetch(request, process.env, {});
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    if (response.body) {
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Adapter error:", error);
    res.status(500).send("Internal Server Error");
  }
}
