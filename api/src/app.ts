import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import assetsRoutes from './routes/assets.routes'
import zonesRoutes from './routes/zones.routes'
import incidentsRoutes from './routes/incidents.routes'
import vehiclesRoutes from './routes/vehicles.routes'
import { openApiDocument } from './docs/openapi'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/assets', assetsRoutes)
app.use('/zones', zonesRoutes)
app.use('/incidents', incidentsRoutes)
app.use('/vehicles', vehiclesRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
