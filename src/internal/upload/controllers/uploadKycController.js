import path from 'path';
import fs from 'fs';
import { parseExcelPKyc, parseExcelPNum } from '../services/uploadKycService.js';
import db from '../../../config/knexClient.js';
import EventEmitter from 'events';

const progressEmitter = new EventEmitter();
let clients = [];

export const sseController = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    clients.push(res);

    console.log('Client connected!');

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
        console.log("Client disconnected!");
    });
};

export const sendEventsToClients = (data) => {
    clients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
};

export const closeSSEConnections = () => {
    clients.forEach(client => client.end()); 
    clients = []; 
};

export const uploadKyc = async (req, res) => {
    try {
        if(!req){
            console.log("File not uploaded");
            return res.status(500).json({error: 'file not found'});
        }
        const filepath = path.join(req.file.path);
        console.log(filepath);

        const uploadData = await parseExcelPKyc(filepath);

        const batchSize = 1000;
        const totalBatches = Math.ceil(uploadData.length/batchSize);

        if(uploadData.length > 0){
            console.log("data before insertion :", uploadData.slice(0, 10));
            progressEmitter.on('progress', (percentage) => {
                console.log(`Insertion progress: ${percentage}`);
            })

            for (let i = 0; i < totalBatches; i++) {
                const batch = uploadData.slice(i*batchSize, (i + 1)*batchSize);

                await db.batchInsert('ParentKyc', batch, batchSize);
                 
                const percentage = Math.round(((i + 1)/totalBatches)*100);
                progressEmitter.emit('progress', percentage);  
                sendEventsToClients({ message: `Inserted Kyc Batch ${i + 1} of ${totalBatches}`, percentage });
            } 

            closeSSEConnections();
        }

        fs.unlinkSync(filepath);

        return res.status(200).json({message: 'Data Uploaded Successfully'});

    } catch (error) {
        console.log(`error: ${error.stack}`);
        return res.status(500).json({error: error.message});
    }
}

export const uploadNum = async(req, res) => {
    try {
        if(!req.file){
            return res.status(500).json({error: 'File not uploaded!'});
        }
        const filepath = path.join(req.file.path);
    
        const uploadData = await parseExcelPNum(filepath);

        const batchSize = 1000;
        const totalBatches = Math.ceil(uploadData.length/batchSize);
    
        if(uploadData.length > 0){
            console.log("Data before insertion:", uploadData.slice(0, 10));
            progressEmitter.on('progress', (percentage) => {
                console.log(`Insertion progress: ${percentage}`)
            });

            for (let i = 0; i < totalBatches; i++) {
                let batch = uploadData.slice(i*batchSize, (i + 1)*batchSize);
                await db.batchInsert('ParentPhoneNumber', batch, batchSize);
                const percentage = Math.round(((i + 1)/totalBatches)*100);
                progressEmitter.emit('progress', percentage);  
                sendEventsToClients({ message: `Inserted Number Batch ${i + 1} of ${totalBatches}`, percentage });
            }
            closeSSEConnections();
        }
    
        fs.unlinkSync(filepath);
    
        return res.status(200).json({message: "Data uploaded successfully"});
    } catch (error) {
        console.log(`Error : ${error.stack}`); 
        return res.status(500).json({error: error.message});
    }
}

