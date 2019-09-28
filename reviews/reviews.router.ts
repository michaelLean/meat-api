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

    public envelope(document: any) {
        let resource = super.envelope(document)
        const restId = document.restaurant._id ? document.restaurant._id : document.restaurant;
        resource._links.restaurant = `restaurants/${restId}`;
        return resource
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

    applyRoutes(application: Server) {
        application.get(`${this.basePath}`, this.findAll)
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        application.post(`${this.basePath}`, this.save)
    }
}

export const reviewRouter = new ReviewRouter;