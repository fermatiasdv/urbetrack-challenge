import { Request, Response } from 'express'
import { assets } from '../data/mock'
import { assetSchema } from '../schemas/asset.schema'

export const getAssets = (req: Request, res: Response) => {
  const { status, type } = req.query
  let result = assets

  if (status) result = result.filter(a => a.status === status)
  if (type) result = result.filter(a => a.type === type)

  res.json(result)
}

export const createAsset = (req: Request, res: Response) => {
  const parsed = assetSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json(parsed.error)
  }

  const newAsset = {
    id: Date.now().toString(),
    ...parsed.data
  }

  assets.push(newAsset)
  res.status(201).json(newAsset)
}
