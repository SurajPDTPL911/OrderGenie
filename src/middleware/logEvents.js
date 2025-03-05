import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const fsPromises = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (error) {
        console.log(error);
    }
}

export const logger = async (req, res, next) => {
    logEvents(`${req.url}\t${req.headers.origin}\t${req.method}`, 'logFile.txt');
    console.log('Logged an event');
    next();
}

export const errorHandler = async (err, req, res, next) => {
    console.log(`${err.stack}\nError logged ${err.message}`);
    logEvents(`${err.name}\t${err.message}`, 'errLog.txt');
    res.status(500).send(err.message);
}
