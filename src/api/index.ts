import express from 'express';
import customer from '@/api/customer';

const registerApiRoutes = (app: express.Application) => {
    const api = getSubrouter(app, '/api')
    .use(express.json());

    api.get('/', (req, res) => {
        res.send('Welcome to the API');
    });
    
    customer.register(getSubrouter(api, '/customer'));        
    
};

const getSubrouter = (app: express.Router, path: string) => {
    const subrouter = express.Router();
    app.use(path, subrouter);
    return subrouter;
}

export { registerApiRoutes };