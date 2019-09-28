import * as restify from 'restify';
import * as mongoose from 'mongoose';
import * as fs from 'fs';

import { environment } from '../common/environment';
import { Router } from '../common/router';
import { mergePatchBodyParser } from './merge-patch.parser';
import { handleError } from './error.handler';
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';

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
                
                const options: restify.ServerOptions = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger    
                }

                if (environment.security.enableHTTPS) {
                    options.certificate = fs.readFileSync(environment.security.certificate);
                    options.key = fs.readFileSync(environment.security.key)
                }

                this.application = restify.createServer(options);

                this.application.pre(restify.plugins.requestLogger({
                    log: logger
                }))

                this.application.use(restify.plugins.queryParser());
                this.application.use(restify.plugins.bodyParser());
                this.application.use(mergePatchBodyParser);
                this.application.use(tokenParser);

                for (let router of routes) {
                    router.applyRoutes(this.application)
                }

                this.application.listen(environment.server.port, () => {
                    resolve(this.application)
                });

                this.application.on('restifyError', handleError)
                // req, res, route, error
                /*this.application.on('after', restify.plugins.auditLogger({
                    log: logger,
                    event: 'after',
                    body: true
                }))*/

            } catch (error) {
                reject(error)
            }
        })
    }

    public bootstrap(routes: Router[] = []): Promise<Server> {
        return this.initDB().then(() => this.initRoutes(routes).then(() => this));
    }

    public shutDown() {
        return mongoose.disconnect().then(() => this.application.close())
    }
}