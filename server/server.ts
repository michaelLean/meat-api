import * as restify from 'restify';
import * as mongoose from 'mongoose';

import { environment } from '../common/environment';
import { Router } from '../common/router';

export class Server {

    application: restify.Server;

    private initDB(): Promise<any> {
        (<any>mongoose).Promise = global.Promise;
        return mongoose.connect(environment.db.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
    }

    private initRoutes(routes: Router[]): Promise<restify.Server> {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                });

                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());

                for (let router of routes) {
                    router.applyRoutes(this.application)
                }

                this.application.listen(environment.server.port, () => {
                    resolve(this.application) 
                });

            } catch (error) {
                reject(error)
            }
        })
    }

    public bootstrap(routes: Router[] = []): Promise<Server> {
        return this.initDB().then(() => this.initRoutes(routes).then(() => this));
    }
}