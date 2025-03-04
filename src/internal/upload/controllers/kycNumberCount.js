import db from '../../../config/knexClient.js';

export const kycNumberCount = async (req, res) => {
    try{
        let totalKyc = await db('ParentKyc').count('id');
        res.json(totalKyc);
    } catch (error){
        res.status(500).json({error: 'Unable to fetch data or data not found'});
    }
}

export const phoneNumberCount = async (req, res) => {
    try{
        let totalPhoneNumbers = await db('ParentPhoneNumber').count('id');
        res.json(totalPhoneNumbers);
    } catch (error){
        res.status(500).json({error: 'Unable to fetch data or data not found'});
    }
}

