import express from 'express';
import chokidar from 'chokidar';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';

const PORT = 8000;
const HOST = '127.0.0.1';

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

let buildInProgress = false;
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Notify all connected clients to reload
function notifyReload() {
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'reload' }));
    }
  });
}

// Rebuild on file changes
async function rebuild() {
  if (buildInProgress) return;
  
  buildInProgress = true;
  console.log('\n🔄 Rebuilding...');
  
  const result = spawnSync('npm', ['run', 'build'], {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  if (result.status === 0) {
    console.log('✅ Build complete. Reloading...\n');
    notifyReload();
  } else {
    console.log('❌ Build failed\n');
  }
  
  buildInProgress = false;
}

// Watch for source file changes
chokidar.watch(['app/index.php', 'app/include', 'app/js', 'app/css'], {
  ignored: /node_modules/,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
}).on('change', rebuild);

// Serve static assets from app/
app.use(express.static('app'));

// Inject live-reload script into HTML responses
app.get('/', async (req, res) => {
  try {
    let html = await readFile(resolve('app/index.php'), 'utf8');
    
    // Inject live-reload script before closing body tag
    const liveReloadScript = `
    <script>
      (function() {
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;
        const reconnectDelay = 1000;
        
        function connect() {
          const ws = new WebSocket('ws://${HOST}:${PORT}');
          
          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'reload') {
              console.log('🔄 Page reloading...');
              location.reload();
            }
          };
          
          ws.onopen = () => {
            reconnectAttempts = 0;
            console.log('🔌 Live reload connected');
          };
          
          ws.onerror = () => console.error('❌ Live reload error');
          
          ws.onclose = () => {
            reconnectAttempts++;
            if (reconnectAttempts < maxReconnectAttempts) {
              console.log(\`🔄 Reconnecting in \${reconnectDelay}ms...\`);
              setTimeout(connect, reconnectDelay);
            }
          };
        }
        
        connect();
      })();
    </script>
    `;
    
    html = html.replace('</body>', `${liveReloadScript}</body>`);
    res.send(html);
  } catch (err) {
    res.status(500).send('Error loading index.php');
  }
});

// Start server
httpServer.listen(PORT, HOST, () => {
  console.log(`
🚀 Dev server running at http://${HOST}:${PORT}
📁 Serving from: app/
👀 Watching for changes in: app/index.php, app/include, app/js, app/css
🔄 Hot reload enabled

Press Ctrl+C to stop.
  `);
});
