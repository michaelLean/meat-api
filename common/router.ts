import * as restify from 'restify';
import { EventEmitter } from 'events';
import { NotFoundError } from 'restify-errors';

export abstract class Router extends EventEmitter {
    abstract applyRoutes(application: restify.Server)

    public envelope(document: any): any {
        return document
    }

    public envelopeAll(documents: any[], options: any = {}): any {
        return documents
    }

    public render(response: restify.Response, next: restify.Next) {
        return (document: any) => {
            if (document) {
                this.emit('beforeRender', document)
                response.json(this.envelope(document))
            } else {
                throw new NotFoundError('Documento não Encontrado')
            }
            return next(false);
        }
    }

    public renderAll(response: restify.Response, next: restify.Next, options: any = {}) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach((document, index, array) => {
                    this.emit('beforeRender', document)
                    array[index] = this.envelope(document)
                })
                response.json(this.envelopeAll(documents, options))
            } else {
                response.json(this.envelopeAll([], options))
            }
            return next(false);
        }
    }
}