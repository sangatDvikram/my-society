/**
 * VisitorController unit tests (owner-service microservice controller)
 *
 * Tests the TCP MessagePattern and EventPattern handlers in isolation.
 * VisitorService is fully mocked — no database I/O occurs.
 */

import { Test, type TestingModule } from '@nestjs/testing'

import { type CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorLog, VisitorStatus } from './entities/visitor-log.entity'
import { VisitorController } from './visitor.controller'
import { VisitorService } from './visitor.service'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_ID   = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const MOCK_FLAT = 'ffffffff-0000-1111-2222-333333333333'
const MOCK_SOC  = '44444444-5555-6666-7777-888888888888'

function makeLog(overrides: Partial<VisitorLog> = {}): VisitorLog {
  return Object.assign(new VisitorLog(), {
    id:                MOCK_ID,
    societyId:         MOCK_SOC,
    flatId:            MOCK_FLAT,
    visitorName:       'John Doe',
    phoneEncrypted:    '[ENCRYPTED:+919876543210]',
    phoneHash:         '[HMAC:+919876543210]',
    vehicleNumber:     null,
    purpose:           'Delivery',
    status:            VisitorStatus.PENDING,
    entryPhotoKey:     null,
    approvedByOwnerId: null,
    entryAt:           null,
    exitAt:            null,
    gdprConsentGiven:  false,
    createdAt:         new Date('2026-05-01T10:00:00Z'),
    updatedAt:         new Date('2026-05-01T10:00:00Z'),
    deletedAt:         null,
    ...overrides,
  })
}

const mockVisitorService = {
  create:     jest.fn(),
  recordExit: jest.fn(),
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VisitorController', () => {
  let controller: VisitorController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitorController],
      providers: [
        { provide: VisitorService, useValue: mockVisitorService },
      ],
    }).compile()

    controller = module.get<VisitorController>(VisitorController)
    jest.clearAllMocks()
  })

  // ── handleCreate() ────────────────────────────────────────────────────────────

  describe('handleCreate() — @MessagePattern("visitor.create")', () => {
    const dto: CreateVisitorLogDto = {
      societyId:    MOCK_SOC,
      flatId:       MOCK_FLAT,
      visitorName:  'John Doe',
      visitorPhone: '+919876543210',
      purpose:      'Delivery',
    }

    it('delegates to visitorService.create() with the payload DTO', async () => {
      const entity = makeLog()
      mockVisitorService.create.mockResolvedValue(entity)

      await controller.handleCreate(dto)

      expect(mockVisitorService.create).toHaveBeenCalledWith(dto)
    })

    it('returns the VisitorLog entity created by the service', async () => {
      const entity = makeLog()
      mockVisitorService.create.mockResolvedValue(entity)

      const result = await controller.handleCreate(dto)

      expect(result).toEqual(entity)
      expect(result.id).toBe(MOCK_ID)
      expect(result.status).toBe(VisitorStatus.PENDING)
    })

    it('propagates service errors back to the TCP caller', async () => {
      mockVisitorService.create.mockRejectedValue(new Error('DB unavailable'))

      await expect(controller.handleCreate(dto)).rejects.toThrow('DB unavailable')
    })
  })

  // ── handleExit() ──────────────────────────────────────────────────────────────

  describe('handleExit() — @EventPattern("visitor.exit")', () => {
    it('delegates to visitorService.recordExit() with the visitor log ID', async () => {
      mockVisitorService.recordExit.mockResolvedValue(undefined)

      await controller.handleExit({ visitorLogId: MOCK_ID })

      expect(mockVisitorService.recordExit).toHaveBeenCalledWith(MOCK_ID)
    })

    it('resolves to void (fire-and-forget — no return value expected)', async () => {
      mockVisitorService.recordExit.mockResolvedValue(undefined)

      const result = await controller.handleExit({ visitorLogId: MOCK_ID })

      expect(result).toBeUndefined()
    })

    it('does not throw when the service resolves without errors', async () => {
      mockVisitorService.recordExit.mockResolvedValue(undefined)

      await expect(
        controller.handleExit({ visitorLogId: MOCK_ID }),
      ).resolves.not.toThrow()
    })
  })
})
