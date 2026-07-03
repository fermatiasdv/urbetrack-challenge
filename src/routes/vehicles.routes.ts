import { Router } from 'express'
import { getVehicles, getVehicleById, createVehicle } from '../controllers/vehicles.controller'

const router = Router()

router.get('/', getVehicles)
router.get('/:id', getVehicleById)
router.post('/', createVehicle)

export default router
