import { Server, Request, Response, Next } from 'restify';
import { ModelRouter } from '../common/model-router';
import { Restaurant } from './restaurants.model';
import { authorize } from '../security/authz.handler';

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
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.VerifyId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.VerifyId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.VerifyId, this.remove])

        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu])
        application.put(`${this.basePath}/:id/menu`, [authorize('admin'), this.validateId, this.VerifyId, this.replaceMenu])
    }
}

export const restaurantRouter = new RestaurantRouter();