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
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/analytics' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const event = JSON.parse(body);
            const logPath = '/home/team/shared/analytics_log.json';
            
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
