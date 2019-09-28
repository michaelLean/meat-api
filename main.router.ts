import { Router } from './common/router'
import * as restify from 'restify'

class MainRouter extends Router {
    applyRoutes(application: restify.Server) {
        application.get('/', (req: restify.Request, resp: restify.Response, next: restify.Next) => {
            resp.json({
                users: '/users',
                restaurants: '/restaurants',
                reviews: '/reviews'
            })
            next();
        })
    }
}

export const mainRouter = new MainRouter()
