import db from '../../../config/knexClient.js';

export const displayOrderFileService = async (page, limit) => {
    try {
      const offset = (page-1)*limit;
      console.log(offset);
        const result = db("OrderFileOne as c")
      .select(
        "c.id",
        "c.filename",
        "c.required_KYC",
        "v.vendor_name as cardVendor",
        "b.bank_name as cardBank",
        "n.network_name as CardNetwork",
        "c.created_at"
      )
      .join("CardVendor as v", "c.CardVendor_id", "v.id")
      .join("CardBank as b", "c.CardBank_id", "b.id")
      .join("CardNetwork as n", "c.CardNetwork_id", "n.id")
      .orderBy("c.created_at", "desc")
      .offset(offset)
      .limit(limit);

      return result;
        
    } catch (error) {
        console.log(error.stack);
        return {status: 500, message: "Error occured, check console!"};
    }
}