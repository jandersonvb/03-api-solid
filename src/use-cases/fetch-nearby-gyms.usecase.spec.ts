import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms.usecase'

let gymsRepository: InMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

describe('Fetch Nearby Gyms Use Case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  it('should be able to fetch nearby gym', async () => {
    await gymsRepository.create({
      title: 'Near Gym',
      description: 'Academia 1',
      phone: '123456789',
      latitude: -22.429696,
      longitude: -45.4524928,
    })

    await gymsRepository.create({
      title: 'Far Gym',
      description: 'Academia 2',
      phone: '123456789',
      latitude: -22.2506298,
      longitude: -45.709685,
    })

    const { gyms } = await sut.execute({
      userLatitude: -22.429696,
      userLongitude: -45.4524928,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'Near Gym' })])
  })
})