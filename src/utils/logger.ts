import { UUID } from "crypto";
import mysql from "mysql2/promise";
import { ResponseData } from "@/utils/index";

type LogEntry = {
    user?: UUID;
    message: string;
};

let systemUser: UUID = '00000000-0000-0000-0000-000000000000';

const logMessage = (connection: mysql.PoolConnection, log: LogEntry) => {
    const sql_querry = /*sql*/`INSERT INTO log(user_fk, message) VALUES (uuid_to_bin(?), ?)`;
    connection.execute(sql_querry, [log.user || systemUser, log.message]);
}

export {
    logMessage,
    LogEntry
};