import db from '../../../config/knexClient.js';

export const displayOrderFileService = async () => {
    try {
        const result = await db("OrderFileOne as c")
      .select(
        "c.filename",
        "c.required_KYC",
        "v.vendor_name as cardVendor",
        "b.bank_name as cardBank",
        "n.network_name as CardNetwork",
        "c.created_at"
      )
      .join("CardVendor as v", "c.CardVendor_id", "v.id")
      .join("CardBank as b", "c.CardBank_id", "b.id")
      .join("CardNetwork as n", "c.CardNetwork_id", "n.id");

      console.log(result);

      return result;
        
    } catch (error) {
        console.log(error.stack);
        return {status: 500, message: "Error occured, check console!"};
    }
}