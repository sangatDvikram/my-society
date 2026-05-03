/**
 * VisitorProxyController unit tests
 *
 * Tests the HTTP controller layer in isolation. VisitorProxyService is fully
 * mocked — no TCP transport is involved.
 */

import { Test, TestingModule } from '@nestjs/testing'
import { of, throwError } from 'rxjs'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorProxyController } from './visitor-proxy.controller'
import { VisitorProxyService } from './visitor-proxy.service'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockService = {
  createVisitorLog: jest.fn(),
  recordVisitorExit: jest.fn(),
}

const dto: CreateVisitorLogDto = {
  societyId:    '44444444-5555-6666-7777-888888888888',
  flatId:       'ffffffff-0000-1111-2222-333333333333',
  visitorName:  'Jane Doe',
  visitorPhone: '+919876543210',
  purpose:      'Meeting',
}

const mockLog = {
  id:          'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  visitorName: 'Jane Doe',
  status:      'PENDING',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VisitorProxyController', () => {
  let controller: VisitorProxyController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitorProxyController],
      providers: [
        { provide: VisitorProxyService, useValue: mockService },
      ],
    }).compile()

    controller = module.get<VisitorProxyController>(VisitorProxyController)
    jest.clearAllMocks()
  })

  // ── create() ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('delegates to visitorProxyService.createVisitorLog() with the DTO', (done) => {
      mockService.createVisitorLog.mockReturnValue(of(mockLog))

      controller.create(dto).subscribe({
        next: (result) => {
          expect(mockService.createVisitorLog).toHaveBeenCalledWith(dto)
          expect(result).toEqual(mockLog)
          done()
        },
      })
    })

    it('returns an Observable (not a Promise)', () => {
      mockService.createVisitorLog.mockReturnValue(of(mockLog))
      const result = controller.create(dto)
      // An Observable has a subscribe method
      expect(typeof result.subscribe).toBe('function')
    })

    it('propagates service errors to the caller', (done) => {
      const err = new Error('owner-service down')
      mockService.createVisitorLog.mockReturnValue(throwError(() => err))

      controller.create(dto).subscribe({
        error: (e: unknown) => {
          expect(e).toBe(err)
          done()
        },
      })
    })
  })

  // ── exit() ────────────────────────────────────────────────────────────────────

  describe('exit()', () => {
    it('delegates to visitorProxyService.recordVisitorExit() with the log ID', () => {
      const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      mockService.recordVisitorExit.mockReturnValue(undefined)

      controller.exit(id)

      expect(mockService.recordVisitorExit).toHaveBeenCalledWith(id)
    })

    it('returns void (fire-and-forget — callers do not await)', () => {
      mockService.recordVisitorExit.mockReturnValue(undefined)
      const result: void = controller.exit('some-id')
      expect(result).toBeUndefined()
    })
  })
})
