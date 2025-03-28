import db from '../../../config/knexClient.js'

export const getKyc = async (getKycNum, bin) => {
    try {
      console.log(getKycNum, bin);

      const binId = await getBinId(bin);

      console.log(binId[0].id);
  
      const skipRecords = await findSkipRecords(binId[0].id);

      console.log(skipRecords);
  
      console.log(`OFFSET: ${skipRecords.kyc_index}`);
  
      const recordsToCopy = await db("ParentKyc")
        .select("first_name", "middle_name", "last_name", "email", "is_active")
        .offset(skipRecords.kyc_index)
        .limit(getKycNum);
  
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

      console.log(skipRecords);
  
      console.log(`OFFSET: ${skipRecords.phone_index}`);
  
      const recordsToCopy = await db("ParentPhoneNumber")
        .select("number", "is_active")
        .offset(skipRecords.phone_index)
        .limit(getKycNum);
  
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
    const id = await  db('BIN').where({bin_number: bin}).select('id');
    console.log(id)
    const bin_id = id[0].id;
    console.log(bin_id);
    const skipRecordsKyc = await db("BinKycIndex")
      .where("bin_id", bin_id)
      .select("kyc_index", "phone_index")
      .first();
    console.log("This is find skip records : ",skipRecordsKyc);
    return skipRecordsKyc;
  };

  const getBinId = async(bin_name) => {
    console.log(bin_name);
    const id = await db('BIN').select('id').where({bin_number: bin_name});
    console.log(id);
    return id;
  }