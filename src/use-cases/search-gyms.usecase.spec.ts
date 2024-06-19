import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymsUseCase } from './search-gyms.usecase'

let gymsRepository: InMemoryGymsRepository
let sut: SearchGymsUseCase

describe('Search Gym Use Case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new SearchGymsUseCase(gymsRepository)
  })

  it('should be able search for gym', async () => {
    await gymsRepository.create({
      title: 'Javascript Gym',
      description: 'Academia 1',
      phone: '123456789',
      latitude: -22.429696,
      longitude: -45.4524928,
    })

    await gymsRepository.create({
      title: 'React Gym',
      description: 'Academia 2',
      phone: '123456789',
      latitude: -22.429696,
      longitude: -45.4524928,
    })

    const { gyms } = await sut.execute({
      query: 'Javascript',
      page: 1
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'Javascript Gym' })])
  })

  it('should be able search for gym with pagination', async () => {
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        title: `Gym ${i}`,
        description: `Academia ${i}`,
        phone: '123456789',
        latitude: -22.429696,
        longitude: -45.4524928,
      })
    }

    const { gyms } = await sut.execute({
      query: 'Gym',
      page: 2
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ title: 'Gym 21' }),
      expect.objectContaining({ title: 'Gym 22' }),
    ])
  })
})