import db from "../config/knexClient.js";

export const addToBinKycIndex = async (req, res) => {
    try {
      const { bin_number, kyc_index, phone_index } = req.body;
  
      const bin_id = await db("BIN").where({ bin_number: bin_number }).first();
  
      console.log(bin_id.id, kyc_index, phone_index);
  
      const binId = bin_id.id;
  
      console.log(binId);
  
      const binExists = await db("BIN").where({ id: binId }).first();
  
      console.log(binExists);
  
      if (!binExists) {
        return res
          .status(400)
          .json({ message: "bin_id does not exist in BIN table" });
      }
  
      await db("BinKycIndex").insert({
        bin_id: binId,
        kyc_index: parseInt(kyc_index),
        phone_index: parseInt(phone_index),
      });
  
      return res.status(200).json({ message: "Record inserted!" });
    } catch (error) {
      console.log(`error : ${error.stack}`);
      return res.status(400).json({ message: "error occured !" });
    }
  };

export const addCardNetwork = async (req, res) => {
  try {
    const { network_name } = req.body;

    const doesExist = await db("CardNetwork").where({ network_name }).first();

    console.log("This is network_name", doesExist);

    if (doesExist) {
      return res.status(400).json({ message: "Card Network Exists!" });
    }

    await db("CardNetwork").insert({ network_name });

    return res.status(200).json({ messsage: "Network added!" });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const addCardBank = async (req, res) => {
  try {
    const { bank_name } = req.body;

    const doesExist = await db("CardBank").where({ bank_name }).first();

    console.log("This is the bank name", doesExist);

    if (doesExist) {
      return res.status(400).json({ message: "Card Bank Exists!" });
    }

    await db("CardBank").insert({ bank_name });

    return res.status(200).json({ messsage: "Bank added!" });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const addCardVendor = async (req, res) => {
  try {
    const { vendor_name } = req.body;

    const doesExist = await db("CardVendor").where({ vendor_name }).first();

    console.log("This is the vendor name", doesExist);

    if (doesExist) {
      return res.status(400).json({ message: "Card Vendor Exists!" });
    }

    await db("CardVendor").insert({ vendor_name });

    return res.status(200).json({ messsage: "Vendor added!" });
  } catch (error) {
    console.log(error.stack);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};


