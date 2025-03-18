import { generateExcel } from "../services/generateOrderFileService.js";

export const generateExcelFile = async (req, res) => {
  try {
    const { fileName } = req.body;
    const result = await generateExcel(fileName);
    if (result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }
  
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);
    res.setHeader("Content-Length", result.buffer.length);

    res.end(result.buffer);
  } catch (error) {
    console.log(error.stack);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
