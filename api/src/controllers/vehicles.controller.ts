import { Request, Response } from 'express'
import { vehicles } from '../data/vehicles'
import { vehicleSchema } from '../schemas/vehicle.schema'

export const getVehicles = (req: Request, res: Response) => {
  const { status, type, zoneId } = req.query
  let result = vehicles

  if (status) result = result.filter(v => v.status === status)
  if (type) result = result.filter(v => v.type === type)
  if (zoneId) result = result.filter(v => v.zoneId === zoneId)

  res.json(result)
}

export const getVehicleById = (req: Request, res: Response) => {
  const { id } = req.params
  const vehicle = vehicles.find(v => v.id === id)

  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' })
  }

  res.json(vehicle)
}

export const createVehicle = (req: Request, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json(parsed.error)
  }

  const newVehicle = {
    id: Date.now().toString(),
    ...parsed.data
  }

  vehicles.push(newVehicle)
  res.status(201).json(newVehicle)
}
