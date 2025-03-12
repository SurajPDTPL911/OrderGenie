import db from "../../../config/knexClient.js";

export const generateBinService = async (binName) => {
  try {
    const bin_number = await db("BIN").where({ bin_number: binName }).first();

    if (bin_number) {
      return { status: 400, message: "Bin does exist!" };
    }

    const [newBin] = await db("BIN")
      .insert({ bin_number: binName })
      .returning(["id", "bin_number"]);

    return { status: 200, message: "Bin added", newBin };
  } catch (error) {
    console.log(`error: ${error.stack}`);
    return { status: 500, message: "Internal server error!" };
  }
};
