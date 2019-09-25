import { Server, Request, Response, Next } from 'restify';
import { Router } from '../common/router';
import { User } from './users.model';
import { NotFoundError } from 'restify-errors';

class UserRouter extends Router {

    constructor() {
        super()
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    applyRoutes(application: Server) {
        application.get('/users', (req: Request, res: Response, next: Next) => {
            User.find()
                .then(this.render(res, next))
                .catch(next)
        })

        application.get('/users/:id', (req: Request, res: Response, next: Next) => {
            User.findById(req.params.id)
                .then(this.render(res, next))
                .catch(next)
        })

        application.post('/users', (req: Request, res: Response, next: Next) => {
            let user = new User(req.body);
            user.save()
                .then(this.render(res, next))
                .catch(next)
        })

        application.put('/users/:id', (req: Request, res: Response, next: Next) => {
            const options = { overwrite: true, runValidators: true }
            User.update({ _id: req.params.id }, req.body, options)
                .exec()
                .then((result) => {
                    if (result.n) {
                        return User.findById(req.params.id)
                    } else {
                        throw new NotFoundError('Documento não Encontrado')
                    }
                })
                .then(this.render(res, next))
                .catch(next)
        })

        application.patch('/users/:id', (req: Request, res: Response, next: Next) => {
            const options = { new: true, runValidators: true }
            User.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(res, next))
                .catch(next)
        })

        application.del('/users/:id', (req: Request, res: Response, next: Next) => {
            User.deleteOne({ _id: req.params.id })
                .then((result) => {
                    if (result.n) {
                        res.send(204)
                    } else {
                        throw new NotFoundError('Documento não Encontrado')
                    }
                    return next();
                })
                .catch(next)
        })
    }
}

export const userRouter = new UserRouter;