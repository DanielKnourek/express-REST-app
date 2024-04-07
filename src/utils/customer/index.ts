import { getConnection } from '@/utils/db';
import { customerSchema, type Customer, type NewCustomer } from '@/utils/customer/customerSchema';
import { ResponseData } from '@/utils/index';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { User } from '../user/userSchema';

/**
 * Obtains a connection to database and inserts a new row into 'customer' table.
 * @param customer_data values for the new customer
 * @param caller uuid of the user making the request for logEntry
 * @returns inserted customer data if success=true, error message if success=false
 */
const createCustomer = async (customer_data: NewCustomer, caller?: User['uuid']): Promise<ResponseData<Customer>> => {
    const sql_querry = /*sql*/`INSERT INTO customer(uuid, display_name) VALUES (UUID_TO_BIN(?), ?)`;
    const uuid = randomUUID();

    return getConnection({
        message: `Creating customer {${customer_data.display_name} and uuid: {${uuid}}`,
        user: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [uuid, customer_data.display_name])
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
                    display_name: customer_data.display_name,
                }
            } as ResponseData<Customer>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<Customer>
        })
}

/**
 * Obtains a connection to database and lists all customers in 'customer' table.
 * @param caller uuid of the user making the request for logEntry
 * @returns list of customers if success=true, error message if success=false
 */
const listCustomer = async (caller?: User['uuid']): Promise<ResponseData<Customer[]>> => {
    const sql_querry = /*sql*/`SELECT BIN_TO_UUID(uuid) as uuid, display_name FROM customer`;

    return getConnection({
        message: 'Listing customers',
        user: caller,
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
            } as ResponseData<Customer[]>
        })
        .catch(err => {
            return {
                success: false,
                error: err.message
            } as ResponseData<Customer[]>
        })
}

/**
 * Obtains a connection to database and deletes a row from 'customer' table.
 * @param uuid uuid of the customer to be deleted
 * @param caller uuid of the user making the request for logEntry
 * @returns success=true or error message if success=false
 */
const deleteCustomer = async (uuid: string, caller?: User['uuid']): Promise<ResponseData<void>> => {
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