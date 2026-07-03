import { faker } from '@faker-js/faker'
import { randomCoord } from '../utils/geo'
import { zones } from './zones'
import { UrbanAsset } from '../types'

const TYPES = ['BIN', 'CONTAINER', 'BENCH'] as const

function weightedStatus() {
  const rand = Math.random()
  if (rand < 0.7) return 'OK'
  if (rand < 0.85) return 'FULL'
  if (rand < 0.95) return 'DAMAGED'
  return 'OUT_OF_SERVICE'
}

export function generateAssets(count = 1000): UrbanAsset[] {
  return Array.from({ length: count }).map((_, i) => {
    const { lat, lng } = randomCoord()
    const zone = faker.helpers.arrayElement(zones)

    return {
      id: `${i + 1}`,
      type: faker.helpers.arrayElement(TYPES),
      status: weightedStatus(),
      lat,
      lng,
      address: faker.location.streetAddress(),
      zoneId: zone.id
    }
  })
}
