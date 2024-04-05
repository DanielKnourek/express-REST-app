import mysql from 'mysql2/promise';
import {LogEntry, logMessage} from '@/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const db_pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const getConnection = async (message: LogEntry) => {
    return db_pool.getConnection().then(connection => {
        logMessage(connection, message);
        return connection;
    })
};

export {
    getConnection
};