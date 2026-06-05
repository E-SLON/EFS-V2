/**
 * Auth & Admin Unit Tests
 * Uses Jest mocks — no real database needed
 */

process.env.JWT_SECRET     = 'test_secret_key_32_chars_minimum_here';
process.env.NODE_ENV       = 'test';

const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// ── Mock mongoose models ──────────────────────────────────────────
const mockAdmins = [];
let   nextId = 1;

jest.mock('../models/Admin', () => {
  const bcryptjs = require('bcryptjs');
  function MockAdmin(data) {
    Object.assign(this, data);
    this._id      = String(nextId++);
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.loginCount = data.loginCount || 0;
    this.role     = data.role || 'admin';
    this.toJSON   = () => { const o = { ...this }; delete o.password; return o; };
    this.save     = jest.fn(async () => {
      if (this._new) {
        this.password = await bcryptjs.hash(this.password, 12);
        delete this._new;
        mockAdmins.push(this);
      }
      return this;
    });
    this.comparePassword = async (p) => bcryptjs.compare(p, this.password);
    this._new = true;
  }
  MockAdmin.findOne = jest.fn(async (q) => {
    return mockAdmins.find(a =>
      (q.email && a.email === q.email) ||
      (q._id   && a._id   === q._id)
    ) || null;
  });
  MockAdmin.findById = jest.fn(async (id) => {
    return mockAdmins.find(a => a._id === String(id)) || null;
  });
  MockAdmin.find = jest.fn(async () => [...mockAdmins]);
  MockAdmin.findByIdAndUpdate = jest.fn(async (id, upd) => {
    const a = mockAdmins.find(x => x._id === String(id));
    if (a) { Object.assign(a, upd.$set || upd); return a; }
    return null;
  });
  MockAdmin.findByIdAndDelete = jest.fn(async (id) => {
    const idx = mockAdmins.findIndex(a => a._id === String(id));
    if (idx > -1) mockAdmins.splice(idx, 1);
  });
  MockAdmin.countDocuments = jest.fn(async () => mockAdmins.length);
  MockAdmin.create = jest.fn(async (data) => {
    const a = new MockAdmin(data);
    a.password = await bcryptjs.hash(data.password, 12);
    delete a._new;
    const dup = mockAdmins.find(x => x.email === data.email);
    if (dup) { const err = new Error('duplicate'); err.code = 11000; throw err; }
    mockAdmins.push(a);
    return a;
  });
  return MockAdmin;
});

jest.mock('../models/Order',   () => ({ find: jest.fn(async()=>[]), countDocuments: jest.fn(async()=>0), aggregate: jest.fn(async()=>[]) }));
jest.mock('../models/Product', () => ({ find: jest.fn(async()=>[]), findOne: jest.fn(async()=>null) }));
jest.mock('mongoose', () => ({ connect: jest.fn(), connection: { collections: {} } }));

const request = require('supertest');
const { app }  = require('../server');
const Admin    = require('../models/Admin');

// Helper: create admin + get token
async function makeAdmin(role = 'admin') {
  await Admin.create({ name:'Test',email:`test${Date.now()}@efs.com`,password:'pass123',role });
  const a = mockAdmins[mockAdmins.length-1];
  const token = jwt.sign({ id: a._id }, process.env.JWT_SECRET, { expiresIn:'1h' });
  Admin.findById.mockResolvedValue(a);
  return { admin: a, token };
}

beforeEach(() => {
  mockAdmins.length = 0;
  jest.clearAllMocks();
});

// ── HEALTH CHECK ──────────────────────────────────────────────────
describe('Health Check', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await Admin.create({ name:'Admin', email:'admin@efs.com', password:'password123', role:'admin' });
    Admin.findOne.mockImplementation(async (q) =>
      mockAdmins.find(a => a.email === q['email'.toLowerCase()]) || null
    );
  });

  it('returns token on correct credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email:'admin@efs.com', password:'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.admin.password).toBeUndefined();
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email:'admin@efs.com', password:'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email with 401', async () => {
    Admin.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login')
      .send({ email:'nobody@efs.com', password:'password123' });
    expect(res.status).toBe(401);
  });

  it('rejects missing password with 400', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email:'admin@efs.com' });
    expect(res.status).toBe(400);
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns admin profile with valid token', async () => {
    const { token, admin } = await makeAdmin();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.admin.email).toBe(admin.email);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not_a_real_token');
    expect(res.status).toBe(401);
  });
});

// ── ADMIN SETUP ───────────────────────────────────────────────────
describe('POST /api/admins/setup', () => {
  it('creates first superadmin when no admins exist', async () => {
    Admin.countDocuments.mockResolvedValue(0);
    const res = await request(app).post('/api/admins/setup')
      .send({ name:'Owner', email:'owner@efs.com', password:'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('blocks setup when admins already exist', async () => {
    Admin.countDocuments.mockResolvedValue(3);
    const res = await request(app).post('/api/admins/setup')
      .send({ name:'Hacker', email:'hack@efs.com', password:'hack123' });
    expect(res.status).toBe(403);
  });

  it('requires all fields', async () => {
    Admin.countDocuments.mockResolvedValue(0);
    const res = await request(app).post('/api/admins/setup')
      .send({ name:'Owner' });
    expect(res.status).toBe(400);
  });
});

// ── MANAGE ADMINS ─────────────────────────────────────────────────
describe('GET /api/admins — list', () => {
  it('superadmin can list all admins', async () => {
    const { token } = await makeAdmin('superadmin');
    Admin.find.mockResolvedValue(mockAdmins);
    const res = await request(app)
      .get('/api/admins')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.admins)).toBe(true);
  });

  it('regular admin is forbidden', async () => {
    const { token } = await makeAdmin('admin');
    const res = await request(app)
      .get('/api/admins')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/admins');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admins — create', () => {
  it('superadmin can create a new admin', async () => {
    const { token } = await makeAdmin('superadmin');
    Admin.findOne.mockResolvedValue(null); // no duplicate
    const res = await request(app)
      .post('/api/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'New Staff', email:'staff@efs.com', password:'staff123', role:'admin' });
    expect(res.status).toBe(201);
    expect(res.body.admin.email).toBe('staff@efs.com');
    expect(res.body.admin.password).toBeUndefined();
  });

  it('regular admin cannot create admins', async () => {
    const { token } = await makeAdmin('admin');
    const res = await request(app)
      .post('/api/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'X', email:'x@efs.com', password:'pass123' });
    expect(res.status).toBe(403);
  });

  it('requires name, email, and password', async () => {
    const { token } = await makeAdmin('superadmin');
    const res = await request(app)
      .post('/api/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'Missing Fields' });
    expect(res.status).toBe(400);
  });
});

// ── JWT ───────────────────────────────────────────────────────────
describe('JWT token validation', () => {
  it('signs and verifies token correctly', () => {
    const token   = jwt.sign({ id:'abc123', role:'admin' }, process.env.JWT_SECRET, { expiresIn:'1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('abc123');
    expect(decoded.role).toBe('admin');
  });

  it('rejects a tampered token', () => {
    const token   = jwt.sign({ id:'abc' }, process.env.JWT_SECRET);
    const tampered = token + 'x';
    expect(() => jwt.verify(tampered, process.env.JWT_SECRET)).toThrow();
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ id:'abc' }, process.env.JWT_SECRET, { expiresIn:'0s' });
    await new Promise(r => setTimeout(r, 100));
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
  });
});
