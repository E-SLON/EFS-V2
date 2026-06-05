require('./setup');
const request = require('supertest');
const { app } = require('../server');
const Admin = require('../models/Admin');
const Order = require('../models/Order');

let adminToken;

beforeEach(async () => {
  await Admin.create({ name: 'Admin', email: 'admin@efs.com', password: 'pass123', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@efs.com', password: 'pass123' });
  adminToken = res.body.token;
});

// ── ORDERS ────────────────────────────────────────────────────────
describe('Orders — /api/orders', () => {
  const validOrder = {
    customer: { name: 'Test Customer', phone: '0821234567', email: 'test@test.com', address: '123 Main St, Johannesburg' },
    items: [{ productId: 1, name: 'Test Perfume', brand: 'Test Brand', price: 599, qty: 2, size: '50ml' }],
    total: 1198,
    notes: 'Please pack carefully'
  };

  describe('POST /api/orders — place order', () => {
    it('should place a valid order', async () => {
      const res = await request(app).post('/api/orders').send(validOrder);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toMatch(/^EFS-/);
    });

    it('should reject order with missing customer name', async () => {
      const res = await request(app).post('/api/orders').send({
        ...validOrder,
        customer: { phone: '0821234567', address: '123 Main St' }
      });
      expect(res.status).toBe(400);
    });

    it('should reject order with empty cart', async () => {
      const res = await request(app).post('/api/orders').send({ ...validOrder, items: [] });
      expect(res.status).toBe(400);
    });

    it('should reject order with missing phone', async () => {
      const res = await request(app).post('/api/orders').send({
        ...validOrder,
        customer: { name: 'Test', address: '123 Main St' }
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders — admin', () => {
    beforeEach(async () => {
      await Order.create(validOrder);
      await Order.create({ ...validOrder, customer: { ...validOrder.customer, name: 'Order 2' } });
    });

    it('admin should get all orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(2);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should filter orders by status', async () => {
      await Order.findOneAndUpdate({}, { status: 'delivered' });
      const res = await request(app)
        .get('/api/orders?status=delivered')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBe(1);
    });
  });

  describe('GET /api/orders/stats', () => {
    beforeEach(async () => {
      await Order.create(validOrder);
    });

    it('should return dashboard stats', async () => {
      const res = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.stats.totalOrders).toBe(1);
      expect(res.body.stats.revenue).toBe(1198);
      expect(res.body.stats.newOrders).toBe(1);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('admin should update order status', async () => {
      const order = await Order.create(validOrder);
      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('confirmed');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('admin should delete an order', async () => {
      const order = await Order.create(validOrder);
      const res = await request(app)
        .delete(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const check = await Order.findById(order._id);
      expect(check).toBeNull();
    });
  });
});

// ── PRODUCTS ──────────────────────────────────────────────────────
describe('Products — /api/products', () => {
  describe('GET /api/products', () => {
    it('should return empty array when no products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });
  });

  describe('POST /api/products/seed/all', () => {
    it('admin should seed all products', async () => {
      const res = await request(app)
        .post('/api/products/seed/all')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(30);
    });

    it('products should be queryable after seed', async () => {
      await request(app)
        .post('/api/products/seed/all')
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(30);
    });

    it('should filter products by tag', async () => {
      await request(app).post('/api/products/seed/all').set('Authorization', `Bearer ${adminToken}`);
      const res = await request(app).get('/api/products?tag=oud');
      expect(res.status).toBe(200);
      res.body.products.forEach(p => expect(p.tag).toBe('oud'));
    });

    it('should filter by gender', async () => {
      await request(app).post('/api/products/seed/all').set('Authorization', `Bearer ${adminToken}`);
      const res = await request(app).get('/api/products?gender=women');
      expect(res.status).toBe(200);
      res.body.products.forEach(p => expect(p.gender).toBe('women'));
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/9999');
      expect(res.status).toBe(404);
    });
  });
});

// ── HEALTH CHECK ──────────────────────────────────────────────────
describe('Health Check', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
