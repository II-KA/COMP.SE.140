import request from 'supertest';
import { server as app } from './index';
import { State } from './types/state';
import { delay } from './utils/utils';

describe('Api-gateway', () => {
  beforeEach(async () => {
    await request(app).post('/reset');
  });

  describe(`GET /state`, () => {
    it('Should return RUNNING as the default', async () => {
      await delay(1000);
      const res = await request(app)
        .get('/state')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).toEqual(State.Running);
    });
  });

  describe(`PUT /state`, () => {
    it('should update state with a valid payload', async () => {
      await delay(1000);
      const newState = State.Paused;
      const res1 = await request(app)
        .put('/state')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .send(newState)
        .expect(200);
      expect(res1.text).toEqual(newState);
      const res2 = await request(app)
        .get('/state')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res2.text).toEqual(newState);
    });
  });

  describe(`GET /run-log`, () => {
    it('should update log when state changes', async () => {
      await delay(1000);
      const newState = State.Paused;
      await request(app)
        .put('/state')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .send(newState)
        .expect(200);
      const res = await request(app)
        .get('/run-log')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).toMatch(/RUNNING->PAUSED/);
    });
    it('should not update log when state is changed to same as current state', async () => {
      await delay(1000);
      const newState = State.Running;
      await request(app)
        .put('/state')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .send(newState)
        .expect(200);
      const res = await request(app)
        .get('/run-log')
        .set({ 'Content-Type': 'text/plain', Accept: '*/*' })
        .expect(200);
      expect(res.text).not.toMatch(/RUNNING->RUNNING/);
    });
  });
});
