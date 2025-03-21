import { generateExcel } from "../services/generateOrderFileService.js";
import { getFileName } from "../../../utils/utils.js";

export const generateExcelFile = async (req, res) => {
  try {
    const { id } = req.body;
    const fileName = await getFileName(id);    
    const result = await generateExcel(id);
    if (result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }
  
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName[0].filename}.xlsx`);
    res.setHeader("Content-Length", result.buffer.length);

    res.end(result.buffer);
  } catch (error) {
    console.log(error.stack);
    return res.status(500).json({ message: "Internal Server Error from controller!" });
  }
};
