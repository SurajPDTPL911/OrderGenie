import db from "../../../config/knexClient.js";
import { v4 as uuidv4 } from 'uuid';

export const generateBinService = async (binName) => {
  try {
    const bin_number = await db("BIN").where({ bin_number: binName }).first();

    if (bin_number) {
      return { status: 400, message: "Bin does exist!" };
    }

    const binId = uuidv4();

    const time = new Date();

    const [newBin] = await db("BIN")
      .insert({ id: binId, bin_number: binName, updated_at: time })
      .returning(["id", "bin_number"]);

    return { status: 200, message: "Bin added", newBin };
  } catch (error) {
    console.log(`error: ${error.stack}`);
    return { status: 500, message: "Internal server error!" };
  }
};
