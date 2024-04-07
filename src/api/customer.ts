import { Router } from "express";
import Customer from "@/utils/customer";
import { newCustomerSchema } from "@/utils/customer/customerSchema";
import { Rules, checkACL } from "@/utils/authorization";


const register = (Router: Router) => {
    /**
     * @method GET
     * @path /customer
     * list all customers
     * @param access_token header bearer token for authentication
     * @returns {customer[]} list of customers
     */
    Router.get('/', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const authorized = await checkACL({
            rule: Rules.isAdmin,
            args: []
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        Customer.list(req.caller.uuid)
            .then((result) => {
                if (!result.success) {
                    return res.status(500).send(result.error);
                }
                res.send(result.result);
            });
    });

    /**
     * @method POST
     * @path /customer
     * create a new customer
     * @param body {newCustomer} object
     * @returns {customer} the created customer
     */
    Router.post('/', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const authorized = await checkACL({
            rule: Rules.isAdmin,
            args: []
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        const customer = newCustomerSchema.parse(req.body);
        
        Customer.create(customer, req.caller.uuid)
        .then((result) => {
            if (result.success) {
                res.send(result.result);
            } else {
                res.status(500).send(result.error);
            }
        })
        .catch((err) => {
            res.status(500).send(err.message);
        });
    });

    /**
     * @method DELETE
     * @path /customer/:customer_uuid
     * delete a customer
     * @param customer_uuid {string} uuid of the customer to delete
     * @returns {deleted: customer_uuid} the uuid of the deleted customer
     */
    Router.delete('/:customer_uuid', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const authorized = await checkACL({
            rule: Rules.isMember,
            args: [req.params.customer_uuid]
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        const uuid = req.params.customer_uuid;
        Customer.delete(uuid, req.caller.uuid)
        .then((result) => {
            if (result.success) {
                res.send({deleted: uuid});
            } else {
                res.status(500).send(result.error);
            }
        })
        .catch((err) => {
            res.status(500).send(err.message);
        });    
    });
}

export default { register };