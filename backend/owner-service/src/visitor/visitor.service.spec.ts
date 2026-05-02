import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateVisitorLogDto } from './dto/create-visitor-log.dto'
import { VisitorLog, VisitorStatus } from './entities/visitor-log.entity'
import { VisitorService } from './visitor.service'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_ID    = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const MOCK_FLAT  = 'ffffffff-0000-1111-2222-333333333333'
const MOCK_SOC   = '44444444-5555-6666-7777-888888888888'

function makeLog(overrides: Partial<VisitorLog> = {}): VisitorLog {
  return Object.assign(new VisitorLog(), {
    id:               MOCK_ID,
    societyId:        MOCK_SOC,
    flatId:           MOCK_FLAT,
    visitorName:      'John Doe',
    phoneEncrypted:   '[ENCRYPTED:+919876543210]',
    phoneHash:        '[HMAC:+919876543210]',
    vehicleNumber:    null,
    purpose:          'Delivery',
    status:           VisitorStatus.PENDING,
    entryPhotoKey:    null,
    approvedByOwnerId:null,
    entryAt:          null,
    exitAt:           null,
    gdprConsentGiven: false,
    createdAt:        new Date('2026-05-01T10:00:00Z'),
    updatedAt:        new Date('2026-05-01T10:00:00Z'),
    deletedAt:        null,
    ...overrides,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VisitorService', () => {
  let service: VisitorService
  let repo: jest.Mocked<Repository<VisitorLog>>

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<Repository<VisitorLog>>> = {
      create:   jest.fn(),
      save:     jest.fn(),
      findOne:  jest.fn(),
      update:   jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorService,
        { provide: getRepositoryToken(VisitorLog), useValue: mockRepo },
      ],
    }).compile()

    service = module.get<VisitorService>(VisitorService)
    repo    = module.get(getRepositoryToken(VisitorLog))
  })

  // ── create() ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateVisitorLogDto = {
      societyId:        MOCK_SOC,
      flatId:           MOCK_FLAT,
      visitorName:      'John Doe',
      visitorPhone:     '+919876543210',
      purpose:          'Delivery',
      gdprConsentGiven: true,
    }

    it('saves a new VisitorLog and returns it', async () => {
      const entity = makeLog({ gdprConsentGiven: true })
      repo.create.mockReturnValue(entity)
      repo.save.mockResolvedValue(entity)

      const result = await service.create(dto)

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          societyId:   dto.societyId,
          flatId:      dto.flatId,
          visitorName: dto.visitorName,
          status:      VisitorStatus.PENDING,
        }),
      )
      expect(repo.save).toHaveBeenCalledWith(entity)
      expect(result).toEqual(entity)
    })

    it('defaults gdprConsentGiven to false when omitted', async () => {
      const dtoNoGdpr = { ...dto, gdprConsentGiven: undefined }
      const entity = makeLog()
      repo.create.mockReturnValue(entity)
      repo.save.mockResolvedValue(entity)

      await service.create(dtoNoGdpr)

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ gdprConsentGiven: false }),
      )
    })
  })

  // ── recordExit() ───────────────────────────────────────────────────────────

  describe('recordExit()', () => {
    it('sets status to EXITED and records exitAt', async () => {
      repo.findOne.mockResolvedValue(makeLog())
      repo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] })

      await service.recordExit(MOCK_ID)

      expect(repo.update).toHaveBeenCalledWith(
        MOCK_ID,
        expect.objectContaining({ status: VisitorStatus.EXITED }),
      )
    })

    it('logs a warning and returns silently when log is not found', async () => {
      repo.findOne.mockResolvedValue(null)

      // Should NOT throw — EventPattern handlers must not throw unhandled errors
      await expect(service.recordExit('non-existent-id')).resolves.toBeUndefined()
      expect(repo.update).not.toHaveBeenCalled()
    })
  })

  // ── findOne() ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns the visitor log when found', async () => {
      const entity = makeLog()
      repo.findOne.mockResolvedValue(entity)

      const result = await service.findOne(MOCK_ID)
      expect(result).toEqual(entity)
    })

    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null)
      await expect(service.findOne(MOCK_ID)).rejects.toThrow(NotFoundException)
    })
  })
})
