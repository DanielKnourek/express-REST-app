import { ResponseData } from "@/utils/index";
import { customerSchema } from "@/utils/customer/customerSchema";
import user from "@/utils/user";
import { User, newUserSchema, userBarerTokenSchema, userSchema } from "@/utils/user/userSchema";
import { Router } from "express";
import { z } from "zod";
import { Rules, checkACL } from "@/utils/authorization";

const register = (Router: Router) => {
    /**
     * @method GET 
     * @path /customer/:customer_uuid/user
     * list all users for a customer
     * @param customer_uuid uuid of the customer
     * @param access_token header bearer token for authentication
     */
    Router.get('/', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const req_params = z.object({
            customer_uuid: customerSchema.shape.uuid,
        }).safeParse(req.params);
        if (!req_params.success) {
            return res.status(400).send('Invalid customer uuid parameter in URL');
        }

        const authorized = await checkACL({
            rule: Rules.isMember,
            args: [req_params.data.customer_uuid]
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        user.listBy(req_params.data.customer_uuid, req.caller.uuid)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.status(500).send(err.message);
            });
    });

    /**
     * @method POST
     * @path /customer/:customer_uuid/user
     * create a new user for a customer
     * @param customer_uuid uuid of the customer
     * @param body {newUser} object
     */
    Router.post('/', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const user_data = newUserSchema.safeParse(req.body);
        if (!user_data.success) {
            res.status(400).send('Invalid data for new user');
            return;
        }

        const req_params = z.object({
            customer_uuid: customerSchema.shape.uuid,
        }).safeParse(req.params);
        if (!req_params.success) {
            return res.status(400).send('Invalid customer uuid parameter in URL');
        }

        const authorized = await checkACL({
            rule: Rules.isMember,
            args: [req_params.data.customer_uuid]
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        const create_result = await user.create(user_data.data, req.caller.uuid)
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return {
                    success: false,
                    error: err.message,
                } as ResponseData<User>;
            });

        if (!create_result.success) {
            return res.status(500).send(create_result.error);
        }

        const add_to_customer_result = await user.addToCustomer(
            req_params.data.customer_uuid, create_result.result.uuid, req.caller.uuid)
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return {
                    success: false,
                    error: err.message,
                }
            });

        if (!add_to_customer_result.success) {
            return res.status(500).send(add_to_customer_result.error);
        }

        res.status(201).send(create_result.result);
    });

    /**
     * @method DELETE
     * @path /customer/:customer_uuid/user/:user_uuid
     * delete a user for a customer
     * @param customer_uuid uuid of the customer
     * @param user_uuid uuid of the user
     * @param access_token header bearer token for authentication
     */
    Router.delete('/:user_uuid', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const req_params = z.object({
            customer_uuid: customerSchema.shape.uuid,
            user_uuid: userSchema.shape.uuid,
        }).safeParse(req.params);
        if (!req_params.success) {
            return res.status(400).send('Invalid user uuid parameter in URL');
        }

        const authorized = await checkACL({
            rule: Rules.isMember,
            args: [req_params.data.customer_uuid]
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        user.delete(req_params.data.user_uuid, req.caller.uuid)
            .then((result) => {
                if (!result.success) {
                    res.status(500).send(result.error);
                    return;
                }
                res.status(204).send("Successfully deleted user ${req_params.data.user_uuid}");
            })
            .catch((err) => {
                res.status(500).send(err.message);
            });
    });
}

export default { register };