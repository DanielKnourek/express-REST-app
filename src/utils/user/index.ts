import { getConnection } from '@/utils/db';
import { userSchema, type User, type NewUser, UserBarerToken } from '@/utils/user/userSchema';
import { ResponseData } from '@/utils/index';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Customer } from '../customer/customerSchema';

/**
 * Obtains a connection to database and inserts a new user into 'user' table.
 * @param user_data values for the new user
 * @param caller uuid of the user making the request for logEntry
 * @returns inserted user data if success=true, error message if success=false
 */
const createUser = async (user_data: NewUser, caller: User['uuid']): Promise<ResponseData<User>> => {
    const sql_querry = /*sql*/`INSERT INTO 
        user(uuid, username, full_name, role) 
        VALUES (UUID_TO_BIN(?), ?, ?, ?)`;

    const uuid = randomUUID();

    return getConnection({
        message: `Creating user {${user_data.username} with uuid: {${uuid}}`,
        user: caller
    })
        .then((connection) => {
            return connection.execute(sql_querry, [
                uuid,
                user_data.username,
                user_data.full_name,
                user_data.role
            ])
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('User not created');
            }
        })
        .then((result) => {
            return {
                success: true,
                result: {
                    ...user_data,
                    uuid: uuid,
                }
            } as ResponseData<User>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<User>
        })
}

/**
 * Obtains a connection to database and inserts a new row into 'customer_user' table.
 * @param customer_uuid uuid of the customer to which the user is added
 * @param user_uuid specifies the user to be added to the customer
 * @param caller uuid of the user making the request for logEntry
 * @returns success=true or error message if success=false
 */
const addUserToCustomer = async (customer_uuid: Customer['uuid'], user_uuid: User['uuid'], caller: User['uuid']): Promise<ResponseData<void>> => {
    const sql_querry = /*sql*/`INSERT INTO 
        customer_user(customer_fk, user_fk)
        VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?))`;

    return getConnection({
        message: `Adding user {${user_uuid}} to customer {${customer_uuid}}`,
        user: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [customer_uuid, user_uuid])
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('User not added to customer');
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
 * gives full user data by either 'uuid' or 'access_token'
 * @param identifier user 'access_token' or 'uuid'
 * @returns user data if success=true, error message if success=false
 */
const getUserBy = async (identifier: UserBarerToken | { uuid: User['uuid'] }): Promise<ResponseData<User>> => {
    const sql_querry_uuid = /*sql*/`SELECT BIN_TO_UUID(uuid) as uuid, username, full_name, role, HEX(access_token) as access_token
        FROM user
        WHERE uuid = UNHEX(?)`;

    const sql_querry_access_token = /*sql*/`SELECT BIN_TO_UUID(uuid) as uuid, username, full_name, role, HEX(access_token) as access_token
        FROM user
        WHERE access_token = UNHEX(?)`;

    let sql_querry: string;
    let querry_args: string;
    if ('uuid' in identifier) {
        sql_querry = sql_querry_uuid;
        querry_args = identifier.uuid;
    } else {
        sql_querry = sql_querry_access_token;
        querry_args = identifier.access_token;
    }

    return getConnection({
        message: `Getting user {${querry_args}}`
    })
        .then((connection) => {
            return connection.execute(sql_querry, [querry_args])
        })
        .then(([rows]) => {
            return z.array(userSchema).parseAsync(rows)
        })
        .then(result => {
            return {
                success: true,
                result: result[0],
            } as ResponseData<User>
        })
        .catch(err => {
            return {
                success: false,
                error: err.message
            } as ResponseData<User>
        })
}

/**
 * lists all users in a customer
 * @param customer_uuid uuid of the customer
 * @param caller uuid of the user making the request for logEntry
 * @returns list of users if success=true, error message if success=false
 */
const listUsersBy = async (customer_uuid: Customer['uuid'], caller: User['uuid']): Promise<ResponseData<User[]>> => {
    const sql_querry = /*sql*/`SELECT BIN_TO_UUID(user.uuid) as uuid,
        HEX(access_token) as access_token,
        username, full_name, role
        FROM user
        INNER JOIN customer_user ON user.uuid = customer_user.user_fk
        WHERE customer_user.customer_fk = UUID_TO_BIN(?)`;

    return getConnection({
        message: `Listing users in customer {${customer_uuid}}`,
        user: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [customer_uuid])
        })
        .then(([rows]) => {
            return z.array(userSchema).parseAsync(rows)
        })
        .then(result => {
            return {
                success: true,
                result: result,
            } as ResponseData<User[]>
        })
        .catch(err => {
            return {
                success: false,
                error: err.message
            } as ResponseData<User[]>
        })
}

/**
 * deletes user with user_uuid from 'user' table
 * @param user_uuid user to be deleted
 * @param caller uuid of the user making the request for logEntry
 * @returns success=true or error message if success=false
 */
const deleteUser = async (user_uuid: User['uuid'], caller: User['uuid']): Promise<ResponseData<void>> => {
    const sql_querry = /*sql*/`DELETE FROM user
        WHERE uuid = UUID_TO_BIN(?)`;

    return getConnection({
        message: `Deleting user {${user_uuid}}`,
        user: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [user_uuid])
        })
        .then(([rows]) => {
            if ((rows as any).affectedRows != 1) { // TODO: cast to any
                throw new Error('User not deleted');
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
    create: createUser,
    addToCustomer: addUserToCustomer,
    getBy: getUserBy,
    listBy: listUsersBy,
    delete: deleteUser,
};