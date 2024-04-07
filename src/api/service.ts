
import { Router } from 'express';
import { z } from 'zod';

import { Rules, checkACL } from '@/utils/authorization';
import { customerSchema } from "@/utils/customer/customerSchema";
import { Service, newServiceSchema, serviceSchema } from '@/utils/service/serviceSchema';
import service from '@/utils/service';
import { ResponseData } from "@/utils/index";

/**
 * @method GET
 * @path /customer/:customer_uuid/service
 * list all services for a customer
 * @param customer_uuid uuid of the customer
 * @param access_token header bearer token for authentication
 */
const register = (Router: Router) => {
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

        service.listBy(req_params.data.customer_uuid, req.caller.uuid)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.status(500).send(err.message);
            });
    });

    /**
     * @method POST
     * @path /customer/:customer_uuid/service
     * create a new service for a customer
     * @param customer_uuid uuid of the customer
     * @param body {newService} object
     */
    Router.post('/', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const service_data = newServiceSchema.safeParse(req.body);
        if (!service_data.success) {
            res.status(400).send('Invalid data for new service');
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

        const create_result = await service.create(service_data.data, req.caller.uuid)
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return {
                    success: false,
                    error: err.message
                } as ResponseData<Service>;
            });

        if (!create_result.success) {
            return res.status(500).send(create_result.error);
        }

        const add_to_customer_result = await service.addToCustomer(
            req_params.data.customer_uuid,
            create_result.result.uuid,
            req.caller.uuid
        )
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return {
                    success: false,
                    error: err.message
                };
            });

        if (!add_to_customer_result.success) {
            return res.status(500).send(add_to_customer_result.error);
        }

        res.status(201).send(create_result.result);
    });

    /**
     * @method DELETE
     * @path /customer/:customer_uuid/service/:service_uuid
     * delete a service for a customer
     * @param customer_uuid uuid of the customer
     * @param service_uuid uuid of the service
     * @param access_token header bearer token for authentication
     */
    Router.delete('/:service_uuid', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const req_params = z.object({
            customer_uuid: customerSchema.shape.uuid,
            service_uuid: serviceSchema.shape.uuid,
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

        service.delete(req_params.data.service_uuid, req.caller.uuid)
            .then((result) => {
                if (!result.success) {
                    res.status(500).send(result.error);
                    return;
                }
                res.status(204).send(`Successfully deleted service ${req_params.data.service_uuid}`)
            })
            .catch((err) => {
                res.status(500).send(err.message);
            });
    });
}

export default {
    register
}