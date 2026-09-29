import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const serverDir = fileURLToPath(new URL('../', import.meta.url));
const testSecret = randomBytes(32).toString('hex');

// Fixtures live beside config.js for dependency resolution; no real .env is read.
function configProcess({ fileSecret, envSecret, expected, cwd } = {}) {
  const dir = mkdtempSync(join(serverDir, '.config-test-'));
  try {
    copyFileSync(join(serverDir, 'config.js'), join(dir, 'config.mjs'));
    if (fileSecret !== undefined) writeFileSync(join(dir, '.env'), `JWT_SECRET=${fileSecret}\n`);
    const env = { ...process.env };
    delete env.JWT_SECRET;
    if (envSecret !== undefined) env.JWT_SECRET = envSecret;
    return spawnSync(process.execPath, ['--input-type=module', '-e',
      `import assert from 'node:assert/strict';
       const config = await import(${JSON.stringify(pathToFileURL(join(dir, 'config.mjs')).href)});
       assert.equal(config.JWT_SECRET, ${JSON.stringify(expected)});`
    ], { cwd: cwd || dir, env, encoding: 'utf8' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('missing, empty and whitespace-only secrets fail closed', () => {
  for (const envSecret of [undefined, '', '   ']) {
    const result = configProcess({ envSecret });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET is required/);
  }
});

test('.env loads before config export, independently of working directory', () => {
  const result = configProcess({ fileSecret: testSecret, expected: testSecret, cwd: tmpdir() });
  assert.equal(result.status, 0, result.stderr);
});

test('process environment takes precedence over .env', () => {
  const result = configProcess({ fileSecret: 'fixture-only', envSecret: testSecret, expected: testSecret });
  assert.equal(result.status, 0, result.stderr);
});

test('login and authentication share the configured key; invalid tokens fail', async () => {
  process.env.JWT_SECRET = testSecret;
  const [{ default: express }, { default: bcrypt }, { default: jwt },
    { default: prisma }, { default: auth }, { authenticateToken }] = await Promise.all([
    import('express'), import('bcrypt'), import('jsonwebtoken'),
    import('../prismaClient.js'), import('../auth.js'), import('../middleware/authMiddleware.js')
  ]);
  const originalFind = prisma.user.findUnique;
  const passwordHash = await bcrypt.hash('test-password-only', 10);
  // Only the database lookup is stubbed: login, bcrypt, JWT and middleware are real.
  prisma.user.findUnique = async () => ({ id: 123, name: 'Test', role: 'CLIENT', passwordHash });
  const app = express();
  app.use(express.json());
  app.use('/auth', auth);
  app.get('/protected', authenticateToken, (req, res) => res.json(req.user));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`${url}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test-password-only' })
    });
    assert.equal(response.status, 200);
    const { token } = await response.json();
    assert.equal(jwt.verify(token, testSecret).userId, 123);
    const valid = await fetch(`${url}/protected`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).role, 'CLIENT');
    const wrongKey = jwt.sign({ userId: 123 }, randomBytes(32).toString('hex'));
    const expired = jwt.sign({ userId: 123 }, testSecret, { expiresIn: -1 });
    for (const badToken of [wrongKey, expired]) {
      const denied = await fetch(`${url}/protected`, { headers: { Authorization: `Bearer ${badToken}` } });
      assert.equal(denied.status, 403);
    }
    assert.equal((await fetch(`${url}/protected`)).status, 401);
  } finally {
    prisma.user.findUnique = originalFind;
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  }
});
