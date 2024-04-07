import mysql from "mysql2/promise";
import { z } from "zod";

import { User, userSchema } from "@/utils/user/userSchema";
import { ResponseData } from ".";
import { getConnection } from "./db";


const logEntrySchema = z.object({
    id: z.number().nonnegative(),
    timestamp: z.string().datetime(),
    user_fk: userSchema.shape.uuid.optional(),
    message: z.string().max(255),
});

const newLogEntrySchema = logEntrySchema.omit({ id: true, timestamp: true });

type LogEntry = z.infer<typeof logEntrySchema>;
type NewLogEntry = z.infer<typeof newLogEntrySchema>;


let systemUser: User['uuid'] = '00000000-0000-0000-0000-000000000000';

/**
 * inserts a new entry into the 'log' table
 * @param connection database connection
 * @param log object containing the message to be logged and the user that triggered the log
 */
const logMessage = (connection: mysql.PoolConnection, log: NewLogEntry) => {
    const sql_querry = /*sql*/`INSERT INTO log(user_fk, message) VALUES (uuid_to_bin(?), ?)`;
    connection.execute(sql_querry, [log.user_fk || systemUser, log.message]);
    connection.release();
}

const listLogs = async (page: number, caller: User['uuid']): Promise<ResponseData<LogEntry[]>> => {
    const sql_querry = /*sql*/`SELECT 
        id, timestamp, message,
        BIN_TO_UUID(user_fk) as caller
        FROM log
        ORDER BY id DESC
        LIMIT ? OFFSET ?`;

    const page_size = 50;

    return getConnection({
        message: `Listing all logs`,
        user_fk: caller,
    })
        .then((connection) => {
            return connection.execute(sql_querry, [`${page_size}`, `${page * page_size}`])
                .finally(() => connection.release())
        })
        .then(([rows]) => {
            return z.array(logEntrySchema).parse(rows);
        })
        .then((result) => {
            return {
                success: true,
                result: result
            } as ResponseData<LogEntry[]>
        })
        .catch((err) => {
            return {
                success: false,
                error: err.message
            } as ResponseData<LogEntry[]>
        })
}

export {
    logEntrySchema, LogEntry,
    newLogEntrySchema, NewLogEntry,
    logMessage,
    listLogs
};