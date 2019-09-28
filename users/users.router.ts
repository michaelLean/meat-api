import { Server, Request, Response, Next } from 'restify';
import { User } from './users.model';
import { ModelRouter } from '../common/model-router';
import { authenticate } from '../security/auth.handler';
import { authorize } from '../security/authz.handler';

class UserRouter extends ModelRouter<User> {

    constructor() {
        super(User)
        this.on('beforeRender', document => {
            document.password = undefined
        })
    }

    findByEmail = (req: Request, res: Response, next: Next) => {
        if (req.query.email) {
            User.findByEmail(req.query.email)
                .then(user => user ? [user] : [])
                .then(this.renderAll(res, next, {
                    pageSize: this.pageSize,
                    url: req.url
                }))
                .catch(next)
        } else {
            next();
        }
    }

    applyRoutes(application: Server) {
        application.get({ path: this.basePath, version: '2.0.0' }, [authorize('admin'), this.findByEmail, this.findAll])
        //application.get({ path: '/users', version: '1.0.0' }, this.findAll)
        application.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.VerifyId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.VerifyId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin', 'user'), this.validateId, this.VerifyId, this.remove])

        application.post('/login', authenticate);
    }
}

export const userRouter = new UserRouter;