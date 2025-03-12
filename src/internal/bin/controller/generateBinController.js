import { generateBinService } from "../../bin/services/generateBinService.js";

export const addBin = async (req, res) => {
  const { bin_number } = req.body;

  console.log(bin_number);

  if (!bin_number) {
    return res.status(400).json({ error: "Please upload the  bin number!" });
  }
  const result = await generateBinService(bin_number);

  return res.status(result.status).json(result.message);
};
