import mysql from "mysql2/promise";
import { User } from "@/utils/user/userSchema";

type LogEntry = {
    user?: User['uuid'];
    message: string;
};

let systemUser: User['uuid'] = '00000000-0000-0000-0000-000000000000';

/**
 * inserts a new entry into the 'log' table
 * @param connection database connection
 * @param log object containing the message to be logged and the user that triggered the log
 */
const logMessage = (connection: mysql.PoolConnection, log: LogEntry) => {
    const sql_querry = /*sql*/`INSERT INTO log(user_fk, message) VALUES (uuid_to_bin(?), ?)`;
    connection.execute(sql_querry, [log.user || systemUser, log.message]);
}

export {
    logMessage,
    LogEntry
};