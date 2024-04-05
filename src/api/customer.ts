import { Router } from "express";
import Customer from "@/utils/customer";
import { newCustomerSchema } from "@/utils/customer/customerSchema";


const register = (Router: Router) => {
    Router.get('/', (req, res) => {
        Customer.list()
            .then((result) => {
                if (result.success) {
                    res.send(result.result);
                } else {
                    res.status(500).send(result.error);
                }
            });
    });

    Router.post('/', (req, res) => {
        const customer = newCustomerSchema.parse(req.body);
        
        Customer.create(customer)
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

    Router.delete('/:uuid', (req, res) => {
        const uuid = req.params.uuid;
        Customer.delete(uuid)
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