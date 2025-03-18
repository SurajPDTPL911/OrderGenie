import { handleOrderFileDataService } from '../services/handleOrderFileData.js'

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

          if (!bin || !cardNetwork || !cardVendor || !cardBank || !loadAmounts || 
            !purchaseOrderDate || !requiredKYC || !utrDetails) {
          return { status: 400, message: "Missing required parameters" };
        }
        
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
