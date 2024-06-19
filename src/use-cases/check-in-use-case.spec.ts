import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckInUseCase } from './check-in-use-case'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: '1',
      title: 'Javascript Academy',
      description: 'Academia 1',
      phone: '123456789',
      latitude: -22.429696,
      longitude: -45.4524928,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: '1',
      userId: '1',
      userLatitude: -22.429696,
      userLongitude: -45.4524928,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 1, 1, 10, 8, 0, 0))

    await sut.execute({
      gymId: '1',
      userId: '1',
      userLatitude: -22.429696,
      userLongitude: -45.4524928,
    })

    await expect(() =>
      sut.execute({
        gymId: '1',
        userId: '1',
        userLatitude: -22.429696,
        userLongitude: -45.4524928,
      })).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 1, 10, 8, 0, 0))

    await sut.execute({
      gymId: '1',
      userId: '1',
      userLatitude: -22.429696,
      userLongitude: -45.4524928,
    })

    vi.setSystemTime(new Date(2022, 0, 2, 10, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: '1',
      userId: '1',
      userLatitude: -22.429696,
      userLongitude: -45.4524928,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distance gym', async () => {
    gymsRepository.items.push({
      id: '2',
      title: 'Javascript Academy',
      description: 'Academia 1',
      phone: '123456789',
      latitude: new Decimal(-22.3361247),
      longitude: new Decimal(-45.398146),
    })


    await expect(() =>
      sut.execute({
        gymId: '2',
        userId: '1',
        userLatitude: -22.429696,
        userLongitude: -45.4524928,
      })).rejects.toBeInstanceOf(MaxDistanceError)
  })
})