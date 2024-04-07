import express from 'express';
import customer from '@/api/customer';
import user from '@/api/user';

const registerApiRoutes = (app: express.Application) => {
    const api = getSubrouter(app, '/api')
        .use(express.json());

    api.get('/', (req, res) => {
        res.send('Welcome to the API');
    });

    const customerRouter = getSubrouter(api, '/customer');
    customer.register(customerRouter);

    user.register(getSubrouter(customerRouter, '/:customer_uuid/user'));

};

const getSubrouter = (app: express.Router, path: string) => {
    const subrouter = express.Router({mergeParams: true});
    app.use(path, subrouter);
    return subrouter;
}

export { registerApiRoutes };