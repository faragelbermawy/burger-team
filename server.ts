import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

type BurgerItem = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  category: string;
  basePrice: number;
  image: string;
  calories?: number;
  inStock: boolean;
  stockCount?: number;
  isPopular?: boolean;
  [key: string]: any;
};

const app = express();
app.use(express.json());

// Persistent storage path for menu items
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ITEMS_FILE = path.resolve(DATA_DIR, 'menu-items.json');
const INITIAL_FILE = path.resolve(DATA_DIR, 'initial-menu.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load items from file
let currentItems: BurgerItem[] = [];
try {
  if (fs.existsSync(ITEMS_FILE)) {
    const raw = fs.readFileSync(ITEMS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      currentItems = parsed;
    }
  }
  
  if (currentItems.length === 0 && fs.existsSync(INITIAL_FILE)) {
    const raw = fs.readFileSync(INITIAL_FILE, 'utf-8');
    currentItems = JSON.parse(raw);
    fs.writeFileSync(ITEMS_FILE, raw);
  }
} catch (err) {
  console.error('Error loading items from file:', err);
}

const saveItemsToFile = () => {
  try {
    fs.writeFileSync(ITEMS_FILE, JSON.stringify(currentItems, null, 2));
  } catch (err) {
    console.error('Error saving items to file:', err);
  }
};

// SSE (Server-Sent Events) clients registry for live real-time broadcasting
const sseClients = new Map<string, express.Response>();

const broadcastEvent = (event: { type: string; item?: BurgerItem; items: BurgerItem[] }) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const [clientId, clientRes] of sseClients.entries()) {
    try {
      clientRes.write(payload);
    } catch {
      sseClients.delete(clientId);
    }
  }
};

// 1. API: Get all menu items
app.get('/api/items', (req, res) => {
  res.json({ success: true, items: currentItems });
});

// 2. API: Add new menu item (Real-time live sync across all devices & browsers)
app.post('/api/items', (req, res) => {
  const newItem: BurgerItem = req.body;
  if (!newItem || !newItem.nameAr) {
    res.status(400).json({ success: false, error: 'Product name is required' });
    return;
  }

  // Prepend to catalog so it appears at top
  currentItems = [newItem, ...currentItems.filter((i) => i.id !== newItem.id)];
  saveItemsToFile();

  // Instant broadcast to all connected managers, cashiers, kitchen screens, tablets, phones
  broadcastEvent({
    type: 'ITEM_ADDED',
    item: newItem,
    items: currentItems,
  });

  res.json({ success: true, item: newItem, items: currentItems });
});

// 3. API: Update menu item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem: BurgerItem = req.body;

  currentItems = currentItems.map((item) => (item.id === id ? { ...item, ...updatedItem } : item));
  saveItemsToFile();

  broadcastEvent({
    type: 'ITEM_UPDATED',
    item: updatedItem,
    items: currentItems,
  });

  res.json({ success: true, item: updatedItem, items: currentItems });
});

// 4. API: Toggle stock availability
app.post('/api/items/:id/toggle-stock', (req, res) => {
  const { id } = req.params;
  let targetItem: BurgerItem | undefined;

  currentItems = currentItems.map((item) => {
    if (item.id === id) {
      targetItem = { ...item, inStock: !item.inStock };
      return targetItem;
    }
    return item;
  });

  saveItemsToFile();

  broadcastEvent({
    type: 'ITEM_UPDATED',
    item: targetItem,
    items: currentItems,
  });

  res.json({ success: true, item: targetItem, items: currentItems });
});

// 5. API: Server-Sent Events (SSE) live stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  sseClients.set(clientId, res);

  // Send initial handshake with current items
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', items: currentItems })}\n\n`);

  // Heartbeat to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
  });
});

// 6. Vite middleware for development & static file serving for production
const startServer = async () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Burger Team Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
};

startServer();
