import path from 'path';
import fs from 'fs';
import { parseExcelPKyc, parseExcelPNum } from '../services/uploadKycService.js';
import db from '../../../config/knexClient.js';

export const uploadKyc = async (req, res) => {
    try {
        if(!req){
            console.log("File not uploaded");
            return res.status(500).json({error: 'file not found'});
        }
        const filepath = path.join(req.file.path);
        console.log(filepath);

        const uploadData = await parseExcelPKyc(filepath);

        if(uploadData.length > 0){
            console.log("data before insertion :", uploadData.slice(0, 10));
            await  db.batchInsert('ParentKyc', uploadData, 100);
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
    
        if(uploadData.length > 0){
            console.log("Data before insertion:", uploadData.slice(0, 1));
            await db.batchInsert('ParentPhoneNumber', uploadData, 100);
        }
    
        fs.unlinkSync(filepath);
    
        return res.status(200).json({message: "Data uploaded successfully"});
    } catch (error) {
        console.log(`Error : ${error.stack}`);
        return res.status(500).json({error: error.message});
    }
}

