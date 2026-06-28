const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const UPLOADS = path.join(ROOT, 'uploads');

const APPS = {
  crm: {
    label: 'FedEx CRM',
    accept: ['.json'],
    mime: 'application/json',
  },
  sro: {
    label: 'FedEx SRO',
    accept: ['.xlsx', '.xls'],
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  timstips: {
    label: "Tim's Tips",
    accept: ['.json'],
    mime: 'application/json',
  },
};

function ensureDirs() {
  fs.mkdirSync(UPLOADS, { recursive: true });
  Object.keys(APPS).forEach((app) => {
    fs.mkdirSync(path.join(UPLOADS, app), { recursive: true });
  });
}

function safeName(name) {
  return path.basename(name).replace(/[^a-zA-Z0-9._-가-힣]/g, '_');
}

function listFiles(appKey) {
  const dir = path.join(UPLOADS, appKey);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .map((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      return {
        name,
        size: stat.size,
        updated_at: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

function latestFile(appKey) {
  const files = listFiles(appKey);
  return files.length ? files[0] : null;
}

ensureDirs();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const appKey = req.params.app;
    cb(null, path.join(UPLOADS, appKey));
  },
  filename(req, file, cb) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${ts}_${safeName(file.originalname || 'upload')}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(ROOT, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, apps: Object.keys(APPS) });
});

app.get('/api/status', (_req, res) => {
  const status = {};
  Object.keys(APPS).forEach((key) => {
    const latest = latestFile(key);
    status[key] = {
      label: APPS[key].label,
      file_count: listFiles(key).length,
      latest: latest || null,
    };
  });
  res.json(status);
});

app.get('/api/:app/files', (req, res) => {
  const appKey = req.params.app;
  if (!APPS[appKey]) return res.status(404).json({ error: 'unknown app' });
  res.json({ app: appKey, files: listFiles(appKey) });
});

app.get('/api/:app/latest', (req, res) => {
  const appKey = req.params.app;
  if (!APPS[appKey]) return res.status(404).json({ error: 'unknown app' });
  const latest = latestFile(appKey);
  if (!latest) return res.status(404).json({ error: 'no file uploaded yet' });
  const full = path.join(UPLOADS, appKey, latest.name);
  res.download(full, latest.name);
});

app.get('/api/:app/download/:filename', (req, res) => {
  const appKey = req.params.app;
  if (!APPS[appKey]) return res.status(404).json({ error: 'unknown app' });
  const filename = safeName(req.params.filename);
  const full = path.join(UPLOADS, appKey, filename);
  if (!fs.existsSync(full)) return res.status(404).json({ error: 'file not found' });
  res.download(full, filename);
});

app.post('/api/:app/upload', (req, res, next) => {
  const appKey = req.params.app;
  if (!APPS[appKey]) return res.status(404).json({ error: 'unknown app' });
  next();
}, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'file field required (multipart) or use JSON body route' });
  }
  res.json({
    ok: true,
    app: req.params.app,
    name: req.file.filename,
    size: req.file.size,
  });
});

app.post('/api/:app/upload-json', express.raw({ type: '*/*', limit: '25mb' }), (req, res) => {
  const appKey = req.params.app;
  if (!APPS[appKey]) return res.status(404).json({ error: 'unknown app' });
  if (appKey === 'sro') {
    return res.status(400).json({ error: 'SRO는 JSON이 아닌 엑셀(.xlsx)을 multipart로 업로드하세요.' });
  }
  const body = req.body;
  if (!body || !body.length) return res.status(400).json({ error: 'empty body' });
  try {
    JSON.parse(body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'invalid JSON' });
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${ts}_upload.json`;
  const full = path.join(UPLOADS, appKey, filename);
  fs.writeFileSync(full, body);
  res.json({ ok: true, app: appKey, name: filename, size: body.length });
});

app.listen(PORT, () => {
  console.log(`FedEx Mobile Sync listening on port ${PORT}`);
});
