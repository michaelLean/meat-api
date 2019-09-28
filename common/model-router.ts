import * as mongoose from 'mongoose';

import { Response, Request, Next } from 'restify';
import { Router } from './router';
import { NotFoundError, NotAuthorizedError } from 'restify-errors';

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    protected basePath: string;
    protected pageSize: number;

    constructor(protected model: mongoose.Model<D>) {
        super()
        this.basePath = `/${model.collection.name}`;
        this.pageSize = 2;
    }

    protected prepareAll(query: mongoose.DocumentQuery<D[], D>): mongoose.DocumentQuery<D[], D> {
        return query;
    }

    protected prepareOne(query: mongoose.DocumentQuery<D, D>): mongoose.DocumentQuery<D, D> {
        return query;
    }

    public envelope(document: any): any {
        let resource = Object.assign({ _links: {} }, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource
    }

    public envelopeAll(documents: any[], options: any = {}): any {
        const resource: any = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        }

        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`
            }
        }
        return resource
    }

    public VerifyId = (req: Request, res: Response, next: Next) => {
        if(req.authenticated._id === req.params.id) {
            next()
        } else {
            next(new NotAuthorizedError('User differs'))
        }
    }

    public validateId = (req: Request, res: Response, next: Next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            next(new NotFoundError('Document not Found!'))
        } else {
            next()
        }
    }

    public findAll = (req: Request, res: Response, next: Next) => {
        let page: number = parseInt(req.query._page || 1)
        page = page > 0 ? page : 1;
        const skip: number = (page - 1) * this.pageSize;

        this.model.countDocuments({})
            .then(count =>
                this.prepareAll(this.model.find())
                    .skip(skip)
                    .limit(this.pageSize)
                    .then(this.renderAll(res, next, {
                        page,
                        count,
                        pageSize: this.pageSize,
                        url: req.url
                    }))
            )
            .catch(next)
    }

    public findById = (req: Request, res: Response, next: Next) => {
        this.prepareOne(this.model.findById(req.params.id))
            .then(this.render(res, next))
            .catch(next)
    }

    public save = (req: Request, res: Response, next: Next) => {
        let document = new this.model(req.body);
        document.save()
            .then(this.render(res, next))
            .catch(next)
    }

    public replace = (req: Request, res: Response, next: Next) => {
        const options = { overwrite: true, runValidators: true }
        this.model.update({ _id: req.params.id }, req.body, options)
            .exec()
            .then((result) => {
                if (result.n) {
                    return this.prepareOne(this.model.findById(req.params.id))
                } else {
                    throw new NotFoundError('Documento não Encontrado')
                }
            })
            .then(this.render(res, next))
            .catch(next)
    }

    public update = (req: Request, res: Response, next: Next) => {
        const options = { new: true, runValidators: true }
        this.prepareOne(this.model.findByIdAndUpdate(req.params.id, req.body, options))
            .then(this.render(res, next))
            .catch(next)
    }

    public remove = (req: Request, res: Response, next: Next) => {
        this.model.deleteOne({ _id: req.params.id })
            .then((result) => {
                if (result.n) {
                    res.send(204)
                } else {
                    throw new NotFoundError('Documento não Encontrado')
                }
                return next();
            })
            .catch(next)
    }
}
