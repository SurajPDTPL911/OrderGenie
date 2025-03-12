import { validateAndFetchKycAndNum, handleOrderFileDataService } from '../services/ValidateOrderFileService.js'

export const validate = async(req, res) => {
    try {
        const { requiredKyc, bin } = req.body; 

        console.log(requiredKyc, bin, "In controller!");

        const result = await validateAndFetchKycAndNum(requiredKyc, bin);

        return res.status(result.status).json(result.message);

    } catch (error) {
        console.log(error.stack);
        return res.status(400).json({message: `error: ${error}`})
    }
}

export const handleOrderFileData = async(req, res) => {
    try {
        const {
            bin,
            cardNetwork,
            cardVendor,
            cardBank,
            loadAmounts,
            purchaseOrderDate,
            requiredKYC,
            utrDetails,
          } = req.body;
        
          const result = await handleOrderFileDataService(bin,
            cardNetwork,
            cardVendor,
            cardBank,
            loadAmounts,
            purchaseOrderDate,
            requiredKYC,
            utrDetails)

          return res.status(result.status).json(result.message);

    } catch (error) {
        console.log(error.stack);
        return res.status(400).json({message: `error: ${error}`})        
    }
}
