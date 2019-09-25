import { Server } from './server/server';
import { userRouter } from './users/users.router';
import { restaurantRouter } from './restaurants/restaurants.router';
import { reviewRouter } from './reviews/reviews.router';

const server = new Server

server.bootstrap([userRouter, restaurantRouter, reviewRouter])
    .then((server) => {
        console.log(`Server is listening on: ${server.application.address().port}`)
    })
    .catch((error) => {
        console.log(`Server failed to start - error: ${error}`);
        process.exit(1)
    })