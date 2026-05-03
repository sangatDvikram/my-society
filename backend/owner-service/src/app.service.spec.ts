import { Test, type TestingModule } from '@nestjs/testing'

import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  describe('getHealth()', () => {
    it('returns status "ok"', () => {
      expect(service.getHealth().status).toBe('ok')
    })

    it('identifies as "owner-service"', () => {
      expect(service.getHealth().service).toBe('owner-service')
    })

    it('returns a new object on each call (no shared state)', () => {
      const a = service.getHealth()
      const b = service.getHealth()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })
})
