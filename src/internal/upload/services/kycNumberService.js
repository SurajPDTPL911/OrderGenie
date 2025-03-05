import db from "../../../config/knexClient.js";

export const kycCount = async () => {
  try {
    let totalKyc = await db("ParentKyc").count("id");
    return totalKyc;
  } catch (error) {
    console.log("error in service", error);
    throw new Error("Unable to fetch data or data not found");
  }
};

export const phoneNumberCount = async () => {
  try {
    let totalPhoneNumbers = await db("ParentPhoneNumber").count("id");
    return totalPhoneNumbers;
  } catch (error) {
    console.log("error in service", error);
    throw new Error("Unable to fetch data or data not found");
  }
};
