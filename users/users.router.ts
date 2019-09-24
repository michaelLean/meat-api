import { Server, Request, Response, Next } from 'restify';
import { Router } from '../common/router';
import { User } from './users.model';

class UserRouter extends Router {

    applyRoutes(application: Server) {
        application.get('/users', (req: Request, res: Response, next: Next) => {
            User.find()
                .then((users) => {
                    res.send(users)
                    return next()
                })
                .catch(next)
        })

        application.get('/users/:id', (req: Request, res: Response, next: Next) => {
            User.findById(req.params.id)
                .then((user) => {
                    if (user) {
                        res.send(user)
                        return next();
                    }
                    else {
                        res.send(404)
                        return next();
                    }
                })
                .catch(next)
        })

        application.post('/users', (req: Request, res: Response, next: Next) => {
            let user = new User(req.body);
            user.save()
                .then((result) => {
                    res.send(result)
                    return next();
                })
                .catch(next)
        })
    }
}

export const userRouter = new UserRouter;