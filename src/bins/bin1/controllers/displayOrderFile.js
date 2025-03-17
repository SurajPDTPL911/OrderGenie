import { displayOrderFileService } from "../services/displayOrderFileService.js";

export const displayData = async(req, res) => {
    try {
        const result = await displayOrderFileService();

        if (!result || result.length === 0) {
            return res.status(404).json({ status: 404, message: "No records found" });
        }

        return res.status(200).json(result);    
    } catch (error) {
        console.log(error.stack);
        return {status: 500, message: "Error occured, check console!"};
    }
}