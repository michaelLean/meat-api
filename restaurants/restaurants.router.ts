import { Server, Request, Response, Next } from 'restify';
import { ModelRouter } from '../common/model-router';
import { Restaurant } from './restaurants.model';

class RestaurantRouter extends ModelRouter<Restaurant> {
    constructor() {
        super(Restaurant)
    }

    public envelope(document: any) {
        let resource = super.envelope(document)
        resource._links.menu = `${this.basePath}/${resource._id}/menu`;
        return resource
    }

    private findMenu = (req: Request, res: Response, next: Next) => {
        Restaurant.findById(req.params.id, "+menu")
            .then((restaurant) => {
                if (!restaurant) {
                    next();
                } else {
                    res.json(restaurant.menu);
                    return next();
                }
            })
            .catch(next)
    }

    private replaceMenu = (req: Request, res: Response, next: Next) => {
        Restaurant.findById(req.params.id)
            .then((restaurant) => {
                if (!restaurant) {
                    next();
                } else {
                    restaurant.menu = req.body;
                    return restaurant.save()
                }
            })
            .then((restaurant) => {
                res.json(restaurant.menu);
                next();
            })
            .catch(next)
    }

    public applyRoutes(application: Server) {
        application.get(`${this.basePath}`, this.findAll)
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        application.post(`${this.basePath}`, this.save)
        application.put(`${this.basePath}/:id`, [this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [this.validateId, this.remove])

        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu])
        application.put(`${this.basePath}/:id/menu`, [this.validateId, this.replaceMenu])
    }
}

export const restaurantRouter = new RestaurantRouter();