import db from "../../../config/knexClient.js";

export const getKyc = async (getKycNum, bin) => {
  try {
    console.log(getKycNum, bin);

    const skipRecords = await findSkipRecords(bin);

    console.log(`OFFSET: ${skipRecords.kyc_index}`);

    const recordsToCopy = await db("ParentKyc")
      .select("first_name", "middle_name", "last_name", "email", "is_active")
      .offset(skipRecords.kyc_index)
      .limit(10);

    console.log(recordsToCopy);

    await db("KycOne").insert(recordsToCopy);

    const updated_index = skipRecords.kyc_index + recordsToCopy.length;

    console.log(updated_index);

    await db("BinKycIndex")
      .where("bin_id", bin)
      .update({ kyc_index: updated_index, updated_at: new Date() });

    return { status: 200, message: "It is working! Check kyc tables" };
  } catch (error) {
    console.log(error);
    return { status: 400, message: "Testing error!" };
  }
};

export const getNum = async (getKycNum, bin) => {
  try {
    console.log(getKycNum, bin);

    const skipRecords = await findSkipRecords(bin);

    console.log(`OFFSET: ${skipRecords.phone_index}`);

    const recordsToCopy = await db("ParentPhoneNumber")
      .select("number", "is_active")
      .offset(skipRecords.phone_index)
      .limit(10);

    console.log(recordsToCopy);

    await db("PhoneNumberOne").insert(recordsToCopy);

    const updated_index = skipRecords.phone_index + recordsToCopy.length;

    console.log(updated_index);

    await db("BinKycIndex")
      .where("bin_id", bin)
      .update({ phone_index: updated_index, updated_at: new Date() });

    return { status: 200, message: "It is working! Check num tables" };
  } catch (error) {
    console.log(error);
    return { status: 400, message: "Testing error!" };
  }
};

export const validateAndFetchKycAndNum = async (requiredKyc, bin) => {
  try {
    console.log(requiredKyc, bin, "In service!");

    const leftKyc = await db("KycOne").count("id as count");
    const leftNum = await db("PhoneNumberOne").count("id");

    console.log(leftKyc, leftNum);

    const leftKycCount = leftKyc[0]?.count ? parseInt(leftKyc[0].count) : 0;
    const leftNumCount = leftNum[0]?.count ? parseInt(leftNum[0].count) : 0;
    const requiredKycCount = parseInt(requiredKyc);

    console.log(leftKycCount, leftNumCount, requiredKycCount);

    let fetchedKyc = false;
    let fetchedNum = false;
    let errorMessages = [];

    if (requiredKycCount > leftKycCount) {
      let getKycNum = requiredKycCount - leftKycCount;
      console.log(getKycNum);
      const result = await getKyc(getKycNum, bin);
      if (result.status === 200) {
        fetchedKyc = true;
      } else {
        errorMessages.push("Error in getKyc service");
      }
    }

    if (requiredKycCount > leftNumCount) {
      let getKycNum = requiredKycCount - leftNumCount;
      console.log(getKycNum);
      const result = await getNum(getKycNum, bin);
      if (result.status === 200) {
        fetchedNum = true;
      } else {
        errorMessages.push("Error in getNum service");
      }
    }

    if (errorMessages.length > 0) {
      return {
        status: 400,
        message: "Some operations failed.",
        errors: errorMessages,
      };
    }

    if (fetchedKyc || fetchedNum) {
      return {
        status: 200,
        message: "Required KYC & Phone numbers fetched successfully!",
      };
    }

    return {
      status: 200,
      message: "Sufficient KYC & Phone Number records are already available.",
    };
  } catch (error) {
    console.log("error");
    return { status: 500, message: "Internal server error" };
  }
};

const findSkipRecords = async (bin) => {
  console.log(bin);
  const skipRecordsKyc = await db("BinKycIndex")
    .where("bin_id", bin)
    .select("kyc_index", "phone_index")
    .first();
  return skipRecordsKyc;
};

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

  return {status: 200, message: "This is the end of the service!"};
};
