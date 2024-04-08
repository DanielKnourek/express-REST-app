import { Router } from "express";
import { z } from "zod";
import { Rules, checkACL } from "@/utils/authorization";
import { customerSchema } from "@/utils/customer/customerSchema";
import { listLogs } from "@/utils/logger";

const register = (Router: Router) => {
    /**
     * @method GET 
     * @path /log
     * lists all logs
     * @param access_token header bearer token for authentication
     */
    Router.get('/:page', async (req, res) => {
        if (req.caller === undefined) {
            res.status(400).send('Missing access token');
            return;
        }

        const req_params = z.object({
            page: z.coerce.number().nonnegative().max(1000),
        }).safeParse(req.params);
        if (!req_params.success) {
            return res.status(400).send('Invalid page parameter in URL');
        }

        const authorized = await checkACL({
            rule: Rules.isAdmin,
            args: []
        }, req.caller)
        if (!authorized) {
            return res.status(403).send('Unauthorized');
        }

        listLogs(req_params.data.page, req.caller.uuid)
            .then((result) => {
                if (!result.success) {
                    return res.status(500).send(result.error);
                }
                res.send(result.result);
            })
            .catch((err) => {
                res.status(500).send(err.message);
            });
    });
}

export default { register };