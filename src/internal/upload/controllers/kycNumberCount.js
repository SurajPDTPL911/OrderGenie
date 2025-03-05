import { kycCount, phoneNumberCount } from '../services/kycNumberService.js';

export const getkycNumberCount = async (req, res) => {
    try{
        let totalKyc = await kycCount();
        res.json(totalKyc);
    } catch (error){
        console.log("error from controller", error);
        res.status(500).json({error: 'Unable to fetch data or data not found'});
    }
};      

export const getphoneNumberCount = async (req, res) => {
    try{
        let totalPhoneNumbers = await phoneNumberCount();
        res.json(totalPhoneNumbers);
    } catch (error){
        console.log("error from controller", error);
        res.status(500).json({error: 'Unable to fetch data or data not found'});
    }
};


