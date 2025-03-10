import { validateAndFetchKycAndNum } from '../services/generateOrderFileService.js'

export const validate = async(req, res) => {
    try {
        const { requiredKyc, bin} = req.body; 

        console.log(requiredKyc, bin, "In controller!");

        const result = await validateAndFetchKycAndNum(requiredKyc, bin);

        return res.status(result.status).json(result.message);

    } catch (error) {
        console.log(error.stack);
        return res.status(400).json({message: `error: ${error}`})
    }
}