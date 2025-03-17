import db from "../../../config/knexClient.js";

export const handleOrderFileDataService = async (
  bin,
  cardNetwork,
  cardVendor,
  cardBank,
  loadAmounts,
  purchaseOrderDate,
  requiredKYC,
  utrDetails
) => {
  const today = new Date().toISOString().split("T")[0];
  console.log(today);

  console.log(
    "bin",
    bin,
    "cardNetwork",
    cardNetwork,
    "loadAmounts",
    loadAmounts,
    "purchaseOrderDate",
    purchaseOrderDate,
    "requiredKYC",
    utrDetails,
    "card vendor",
    cardVendor,
    "card bank",
    cardBank
  );

  const fileName = `${cardVendor}_${cardBank}_${cardNetwork}_Virtual_${requiredKYC}_${purchaseOrderDate}`;

  console.log(fileName);

  const bin_id = await db("BIN").where("bin_number", bin).select("id").first();

  const binId = bin_id.id;

  console.log("Bin id : ", binId);

  const cardNetwork_id = await db("CardNetwork")
    .where("network_name", cardNetwork)
    .select("id")
    .first();
  const cardVendor_id = await db("CardVendor")
    .where("vendor_name", cardVendor)
    .select("id")
    .first();
  const cardBank_id = await db("CardBank")
    .where("bank_name", cardBank)
    .select("id")
    .first();

  const networkId = cardNetwork_id.id;
  const bankId = cardBank_id.id;
  const vendorId = cardVendor_id.id;

  console.log(
    "Network id : ",
    networkId,
    "Bank id : ",
    bankId,
    "Vendor id : ",
    vendorId
  );

  const doesExist = await db("OrderFileOne")
    .where({ filename: fileName })
    .select("id")
    .first();

  if (!doesExist) {
    await db("OrderFileOne").insert({
      bin_id: binId,
      CardVendor_id: vendorId,
      CardBank_id: bankId,
      CardNetwork_id: networkId,
      purchase_order_date: purchaseOrderDate,
      filename: fileName,
      required_KYC: requiredKYC,
    });
  }

  const order_file_id = await db("OrderFileOne")
    .where("filename", fileName)
    .first();
  const orderFileId = order_file_id.id;

  console.log("Order file id :", orderFileId);

  console.log(
    "Load amount",
    loadAmounts[0].value,
    "Amount of cards",
    loadAmounts[0].cards
  );
  console.log(
    "UTR amount",
    utrDetails[0].amount,
    "UTR number",
    utrDetails[0].number
  );

  await Promise.all(
    loadAmounts.map(async (loadAmount) => {
      console.log(
        "Load amount:",
        loadAmount.value,
        "Amount of cards:",
        loadAmount.cards
      );

      const existingLoad = await db("OrderFileDataOne")
        .where({
          order_file_id: orderFileId,
          load_amount: loadAmount.value,
          load_amount_card: loadAmount.cards,
        })
        .first();

      if (!existingLoad) {
        await db("OrderFileDataOne").insert({
          order_file_id: orderFileId,
          load_amount_card: loadAmount.cards,
          load_amount: loadAmount.value,
          dob: today,
          bin,
        });
      }
    })
  );

  await Promise.all(
    utrDetails.map(async (utr) => {
      console.log("UTR amount:", utr.amount, "UTR number:", utr.number);

      const existingUTR = await db("UtrDetailOne")
        .where({ order_file_id: orderFileId, utr_number: utr.number })
        .first();

      if (!existingUTR) {
        await db("OrderFileDataOne").insert({
          order_file_id: orderFileId,
          load_amount_card: loadAmount.cards,
          load_amount: loadAmount.value,
          dob: today,
          bin,
        });
      }
    })
  );

  return {status: 200, message: "Data Inserted!"};
};
