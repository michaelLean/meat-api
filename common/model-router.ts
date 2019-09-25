import * as mongoose from 'mongoose';

import { Response, Request, Next } from 'restify';
import { Router } from './router';
import { NotFoundError } from 'restify-errors';

export abstract class ModelRouter<D extends mongoose.Document> extends Router {
    constructor(protected model: mongoose.Model<D>) {
        super()
    }

    protected prepareAll(query: mongoose.DocumentQuery<D[],D>): mongoose.DocumentQuery<D[],D> {
        return query;
    }

    protected prepareOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D> {
        return query;
    }

    public validateId = (req: Request, res: Response, next: Next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            next(new NotFoundError('Document not Found!'))
        } else {
            next()
        }
    }

    public findAll = (req: Request, res: Response, next: Next) => {
        this.prepareAll(this.model.find())
            .then(this.renderAll(res, next))
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
