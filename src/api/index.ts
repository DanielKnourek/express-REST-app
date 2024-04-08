import express from 'express';
import customer from '@/api/customer';
import user from '@/api/user';
import user_lib from '@/utils/user';
import { User, userBarerTokenSchema } from '@/utils/user/userSchema';
import service from './service';
import log from './log';

/**
 * Registers all API routes
 * @param app express application
 */
const registerApiRoutes = (app: express.Application) => {
    const api = getSubrouter(app, '/api')
        .use(express.json())
        .use(require_access_token);

    api.get('/', (req, res) => {
        res.send('Welcome to the API');
    });

    const customerRouter = getSubrouter(api, '/customer');
    customer.register(customerRouter);

    user.register(getSubrouter(customerRouter, '/:customer_uuid/user'));
    service.register(getSubrouter(customerRouter, '/:customer_uuid/service'));

    log.register(getSubrouter(api, '/log'));
};

/**
 * provides subrouter for a given path and router
 * @param app root router
 * @param path path for subrouter
 * @returns router with path "${router.path}${path}"
 */
const getSubrouter = (app: express.Router, path: string) => {
    const subrouter = express.Router({mergeParams: true});
    app.use(path, subrouter);
    return subrouter;
}

declare global {
    namespace Express {
        interface Request {
            caller?: User;
        }
    }
}

/**
 * middleware for parsing and matching access_token to a user,
 * then user data are added to request object
 */
const require_access_token: express.RequestHandler = async (req, res, next) => {
    const req_caller = userBarerTokenSchema.safeParse(req.headers);
    if (!req_caller.success) {
        res.status(400).send('Missing or invalid access token');
        return;
    }

    const caller = await user_lib.getBy({ access_token: req_caller.data.access_token })
    if (!caller.success) {
        res.status(401).send('Could find user while authenticating');
        return;
    }

    req.caller = caller.result;
    next();
    }

export { registerApiRoutes };