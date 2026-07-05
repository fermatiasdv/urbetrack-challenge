import { Request, Response } from 'express'
import { zones } from '../data/zones'

export const getZones = (req: Request, res: Response) => {
  res.json(zones)
}

export const getZoneById = (req: Request, res: Response) => {
  const { id } = req.params
  const zone = zones.find(z => z.id === id)

  if (!zone) {
    return res.status(404).json({ message: 'Zone not found' })
  }

  res.json(zone)
}
