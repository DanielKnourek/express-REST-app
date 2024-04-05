import { getConnection } from '@/utils/db';
import { customerSchema, type customer, type newCustomer } from '@/utils/customer/customerSchema';
import { ResponseData } from '@/utils/index';
import { z } from 'zod';
import { UUID, randomUUID } from 'crypto';

const createCustomer = async (customer: newCustomer): Promise<ResponseData<customer>> => {
    const sql_querry = /*sql*/`INSERT INTO customer(uuid, display_name) VALUES (UUID_TO_BIN(?), ?)`;
    const uuid = randomUUID();

    return getConnection({
        message: `Creating customer {${customer.display_name} and uuid: {${uuid}}`
    })
        .then((connection) => {
            return connection.execute(sql_querry, [uuid, customer.display_name])
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('Customer not created');
            }
        })
        .then((result) => {
            return {
                success: true,
                result: {
                    uuid: uuid,
                    display_name: customer.display_name,
                }
            } as ResponseData<customer>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<customer>
        })
}

const listCustomer = async (): Promise<ResponseData<customer[]>> => {
    const sql_querry = /*sql*/`SELECT BIN_TO_UUID(uuid) as uuid, display_name FROM customer`;

    return getConnection({
        message: 'Listing customers'
    })
        .then(connection => {
            return connection.execute(sql_querry)
        })
        .then(([rows]) => {
            return z.array(customerSchema).parseAsync(rows)
        })
        .then(result => {
            return {
                success: true,
                result
            } as ResponseData<customer[]>
        })
        .catch(err => {
            return {
                success: false,
                error: err.message
            } as ResponseData<customer[]>
        })
}

const deleteCustomer = async (uuid: string, caller?: UUID): Promise<ResponseData<void>> => {
    const sql_querry = /*sql*/`DELETE FROM customer WHERE uuid = UUID_TO_BIN(?)`;

    return getConnection({
        message: `Deleting customer ${uuid}`,
        user: caller
    })
        .then(connection => {
            return connection.execute(sql_querry, [uuid])
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) {
                throw new Error('Customer not deleted');
            }
        })
        .then(result => {
            return {
                success: true,
            } as ResponseData<void>
        })
        .catch(err => {
            return {
                success: false,
                error: err.message
            } as ResponseData<void>
        })

}

export default {
    create: createCustomer,
    list: listCustomer,
    delete: deleteCustomer,
};