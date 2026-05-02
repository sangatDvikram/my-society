import { Test, TestingModule } from '@nestjs/testing'
import { of, throwError } from 'rxjs'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorProxyService } from './visitor-proxy.service'

// ── Mock ClientProxy ──────────────────────────────────────────────────────────

const mockClientProxy = {
  send: jest.fn(),
  emit: jest.fn(),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const dto: CreateVisitorLogDto = {
  societyId:    '44444444-5555-6666-7777-888888888888',
  flatId:       'ffffffff-0000-1111-2222-333333333333',
  visitorName:  'Jane Doe',
  visitorPhone: '+919876543210',
  purpose:      'Meeting',
}

const mockVisitorLog = {
  id:          'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  visitorName: 'Jane Doe',
  status:      'PENDING',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VisitorProxyService', () => {
  let service: VisitorProxyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorProxyService,
        { provide: 'OWNER_SERVICE', useValue: mockClientProxy },
      ],
    }).compile()

    service = module.get<VisitorProxyService>(VisitorProxyService)
    jest.clearAllMocks()
  })

  // ── createVisitorLog() ────────────────────────────────────────────────────

  describe('createVisitorLog()', () => {
    it('calls client.send with "visitor.create" pattern and the DTO', (done) => {
      mockClientProxy.send.mockReturnValue(of(mockVisitorLog))

      service.createVisitorLog(dto).subscribe({
        next: (result) => {
          expect(mockClientProxy.send).toHaveBeenCalledWith('visitor.create', dto)
          expect(result).toEqual(mockVisitorLog)
          done()
        },
      })
    })

    it('propagates errors from owner-service back to the caller', (done) => {
      const error = new Error('owner-service unavailable')
      mockClientProxy.send.mockReturnValue(throwError(() => error))

      service.createVisitorLog(dto).subscribe({
        error: (err: unknown) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  // ── recordVisitorExit() ───────────────────────────────────────────────────

  describe('recordVisitorExit()', () => {
    it('calls client.emit with "visitor.exit" and the log ID', () => {
      const logId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
      mockClientProxy.emit.mockReturnValue(of(undefined))

      service.recordVisitorExit(logId)

      expect(mockClientProxy.emit).toHaveBeenCalledWith('visitor.exit', {
        visitorLogId: logId,
      })
    })

    it('does not await a response (fire-and-forget returns void)', () => {
      mockClientProxy.emit.mockReturnValue(of(undefined))

      // Return value must be void — callers don't subscribe
      const result: void = service.recordVisitorExit('some-id')
      expect(result).toBeUndefined()
    })
  })
})
