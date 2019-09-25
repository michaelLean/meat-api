import * as mongoose from 'mongoose';

import { Server, Request, Response, Next } from 'restify';
import { Review } from './reviews.model';
import { ModelRouter } from '../common/model-router';

class ReviewRouter extends ModelRouter<Review> {

    constructor() {
        super(Review)
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    protected prepareAll(query: mongoose.DocumentQuery<Review[], Review>): mongoose.DocumentQuery<Review[], Review> {
        return query
            .populate('user', 'name')
            .populate('restaurant');
    }

    protected prepareOne(query: mongoose.DocumentQuery<Review, Review>): mongoose.DocumentQuery<Review, Review> {
        return query
            .populate('user', 'name')
            .populate('restaurant');
    }

    /*public findById = (req: Request, res: Response, next: Next) => {
        this.model.findById(req.params.id)
            .populate('user', 'name')
            .populate('restaurant')
            .then(this.render(res, next))
            .catch(next)
    }*/

    applyRoutes(application: Server) {
        application.get('/reviews', this.findAll)
        application.get('/reviews/:id', [this.validateId, this.findById])
        application.post('/reviews', this.save)
    }
}

export const reviewRouter = new ReviewRouter;