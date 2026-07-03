import { Request, Response } from 'express'
import { incidents } from '../data/incidents'
import { incidentSchema } from '../schemas/incident.schema'

export const getIncidents = (req: Request, res: Response) => {
  const { status, type, zoneId } = req.query
  let result = incidents

  if (status) result = result.filter(i => i.status === status)
  if (type) result = result.filter(i => i.type === type)
  if (zoneId) result = result.filter(i => i.zoneId === zoneId)

  res.json(result)
}

export const getIncidentById = (req: Request, res: Response) => {
  const { id } = req.params
  const incident = incidents.find(i => i.id === id)

  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' })
  }

  res.json(incident)
}

export const createIncident = (req: Request, res: Response) => {
  const parsed = incidentSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json(parsed.error)
  }

  const newIncident = {
    id: Date.now().toString(),
    ...parsed.data,
    createdAt: new Date().toISOString()
  }

  incidents.push(newIncident)
  res.status(201).json(newIncident)
}
