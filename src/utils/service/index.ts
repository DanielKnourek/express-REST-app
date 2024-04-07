import { getConnection } from '@/utils/db';
import { ResponseData } from "@/utils/index";
import { User } from "@/utils/user/userSchema";
import { NewService, Service, newServiceSchema, serviceSchema } from "./serviceSchema";
import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Obtains a connection to database and inserts a new service into 'service' table.
 * @param service values for the new service
 * @param caller uuid of the user making the request for logEntry
 * @returns inserted service data if success=true, error message if success=false
 */
const createService = (service: NewService, caller: User['uuid']): Promise<ResponseData<Service>> => {
    const sql_querry = /*sql*/`INSERT INTO 
        service(uuid, display_name)
        VALUES (UUID_TO_BIN(?), ?)`;

    const uuid = randomUUID();

    return getConnection({
        message: `Creating service {${service.display_name}} with uuid: {${uuid}}`,
        user_fk: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [uuid, service.display_name])
                .finally(() => connection.release())
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('Service not created');
            }
        })
        .then((result) => {
            return {
                success: true,
                result: {
                    ...service,
                    uuid: uuid,
                }
            } as ResponseData<Service>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<Service>
        })
}

/**
 * Obtains a connection to database and inserts a new row into 'customer_service' table.
 * @param customer_uuid uuid of the customer to which the service is added
 * @param service_uuid specifies the service to be added to the customer
 * @param caller uuid of the user making the request for logEntry
 * @returns success=true or error message if success=false
 */
const addServiceToCustomer = (customer_uuid: string, service_uuid: string, caller: User['uuid']): Promise<ResponseData<void>> => {
    const sql_querry = /*sql*/`INSERT INTO 
        customer_service(customer_fk, service_fk)
        VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?))`;

    return getConnection({
        message: `Adding service {${service_uuid}} to customer {${customer_uuid}}`,
        user_fk: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [customer_uuid, service_uuid])
                .finally(() => connection.release())
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('Service not added to customer');
            }
        })
        .then((result) => {
            return {
                success: true,
            } as ResponseData<void>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<void>
        })
}

/**
 * list services for a customer
 * @param customer_uuid uuid of the customer
 * @param caller uuid of the user making the request for logEntry
 * @returns list of services or error message if success=false
 */
const listServiciesBy = (customer_uuid: string, caller: User['uuid']): Promise<ResponseData<Service[]>> => {
    const sql_querry = /*sql*/`SELECT 
        BIN_TO_UUID(service.uuid) as uuid,
        service.display_name
        FROM service
        JOIN customer_service ON service.uuid = customer_service.service_fk
        WHERE customer_service.customer_fk = UUID_TO_BIN(?)`;

    return getConnection({
        message: `Listing services for customer {${customer_uuid}}`,
        user_fk: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [customer_uuid])
                .finally(() => connection.release())
        })
        .then(([rows]) => {
            return z.array(serviceSchema).parse(rows)
        })
        .then((result) => {
            return {
                success: true,
                result: result,
            } as ResponseData<Service[]>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<Service[]>
        })
}

/**
 * deletes service with service_uuid from 'service' table
 * @param service_uuid service to be deleted
 * @param caller uuid of the user making the request for logEntry
 * @returns success=true or error message if success=false
 */
const deleteService = (service_uuid: string, caller: User['uuid']): Promise<ResponseData<void>> => {
    const sql_querry = /*sql*/`DELETE FROM service WHERE uuid = UUID_TO_BIN(?)`;

    return getConnection({
        message: `Deleting service {${service_uuid}}`,
        user_fk: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [service_uuid])
                .finally(() => connection.release())
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('Service not deleted');
            }
        })
        .then((result) => {
            return {
                success: true,
            } as ResponseData<void>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<void>
        })
}

export default {
    create: createService,
    addToCustomer: addServiceToCustomer,
    listBy: listServiciesBy,
    delete: deleteService,
}