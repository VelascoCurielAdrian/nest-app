import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './../src/app.module';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import type { App } from 'supertest/types';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('path', '/');
        expect(res.body).toHaveProperty('method', 'GET');
        expect(res.body).toHaveProperty('statusCode', 200);
        expect(res.body).toHaveProperty('data', 'Hello World!');
      });
  });
});
