import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * A tiny Vite plugin to simulate a backend analytics endpoint.
 * Saves analytics data to /home/team/shared/analytics_log.json
 */
const mockAnalyticsPlugin = () => ({
  name: 'mock-analytics',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api')) {
        const logPath = '/home/team/shared/analytics_log.json';
        if (req.url === '/api/analytics') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const event = JSON.parse(body);
                let logs = [];
                if (fs.existsSync(logPath)) {
                  const content = fs.readFileSync(logPath, 'utf-8');
                  logs = JSON.parse(content || '[]');
                }
                logs.push({
                  ...event,
                  timestamp: new Date().toISOString()
                });
                fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'ok' }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to log event' }));
              }
            });
          } else if (req.method === 'GET') {
            try {
              let logs = [];
              if (fs.existsSync(logPath)) {
                const content = fs.readFileSync(logPath, 'utf-8');
                logs = JSON.parse(content || '[]');
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(logs));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to read logs' }));
            }
          }
        } else if (req.url === '/api/products') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            stripeConnected: false,
            onboardingUrl: '/business/bf098211-edda-4ae6-bf5c-440e8ceed1af/finance',
            catalog: [
              {
                id: 'prod_sponsor',
                name: 'Curated Tool Sponsorship',
                description: 'High-visibility placement for leading AI tools, hosting platforms, and API providers.',
                amount_cents: 50000,
                interval: 'month',
                status: 'inactive'
              },
              {
                id: 'prod_boilerplate',
                name: 'Premium Swarm Boilerplates',
                description: 'Ready-to-deploy codebase templates, configuration blueprints, and Docker setup.',
                amount_cents: 4900,
                interval: 'one-time',
                status: 'inactive'
              },
              {
                id: 'prod_consulting',
                name: 'Strategic Consulting & Custom Builds',
                description: 'High-ticket implementation services for custom-designed agent workflows.',
                amount_cents: 150000,
                interval: 'one-time',
                status: 'inactive'
              }
            ]
          }));
        } else if (req.url === '/api/blog') {
          try {
            const guidePath = '/home/team/shared/guide';
            const draftsPath = '/home/team/shared/guide/drafts';
            const posts = [];

            if (fs.existsSync(guidePath)) {
              const files = fs.readdirSync(guidePath);
              for (const file of files) {
                if (file.endsWith('.md')) {
                  const fullPath = path.join(guidePath, file);
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  const firstLine = content.split('\n')[0] || '';
                  const title = firstLine.replace(/^#\s+/, '').trim() || file;
                  posts.push({
                    filename: file,
                    title,
                    status: 'published',
                    mtime: fs.statSync(fullPath).mtime
                  });
                }
              }
            }

            if (fs.existsSync(draftsPath)) {
              const files = fs.readdirSync(draftsPath);
              for (const file of files) {
                if (file.endsWith('.md')) {
                  const fullPath = path.join(draftsPath, file);
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  const firstLine = content.split('\n')[0] || '';
                  const title = firstLine.replace(/^#\s+/, '').trim() || file;
                  posts.push({
                    filename: file,
                    title,
                    status: 'draft',
                    mtime: fs.statSync(fullPath).mtime
                  });
                }
              }
            }

            posts.sort((a, b) => a.filename.localeCompare(b.filename));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(posts));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read blog files' }));
          }
        } else if (req.url.startsWith('/api/blog-content')) {
          try {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const filename = urlObj.searchParams.get('file');
            if (filename) {
              const cleanName = path.basename(filename);
              let filePath = path.join('/home/team/shared/guide', cleanName);
              if (!fs.existsSync(filePath)) {
                filePath = path.join('/home/team/shared/guide/drafts', cleanName);
              }

              if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ content }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'File not found' }));
              }
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing file parameter' }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read file content' }));
          }
        } else if (req.url === '/api/revenue') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            stripeConnected: false,
            balance: {
              available: [{ amount: 0, currency: 'usd' }],
              pending: [{ amount: 0, currency: 'usd' }]
            },
            transactions: [],
            revenue_summary: {
              all_time_earnings_cents: 0,
              pending_earnings_cents: 0,
              refunded_cents: 0
            }
          }));
        } else {
          next();
        }
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockAnalyticsPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
