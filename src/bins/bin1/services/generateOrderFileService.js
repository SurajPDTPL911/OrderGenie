import exceljs from "exceljs";
import db from "../../../config/knexClient.js";

const max_monthly_kyc = 100
const max_yearly_kyc = 1200
const max_monthly_number = 10000
const max_yearly_number = 10000

export const generateExcel = async (req, res) => {
  try {
    const { fileName } = req.body;
    const fileData = await db("OrderFileOne")
      .select(
        "id",
        "CardVendor_id",
        "CardBank_id",
        "CardNetwork_id",
        "required_KYC"
      )
      .where({ filename: fileName });

    const today = new Date().toISOString().split("T")[0];
    console.log(today);

    if (!fileData.length) {
      return res.status(400).json({ message: "Couldn't find data!" });
    }

    const { id, required_KYC } = fileData[0];

    console.log(id, required_KYC);

    const orderFileData = await db("OrderFileDataOne")
      .select("load_amount_card", "load_amount", "bin")
      .where({ order_file_id: id });

    console.log(orderFileData);

    const bin_name = orderFileData[0].bin;

    console.log(bin_name);

    const loadAmounts = orderFileData.map(
      ({ load_amount_card, load_amount }) => ({ load_amount_card, load_amount })
    );

    console.log(loadAmounts);

    let expandedLoadAmounts = [];

    loadAmounts.forEach(({ load_amount, load_amount_card }) => {
      for (let j = 0; j < load_amount_card; j++) {
        expandedLoadAmounts.push({ load_amount });
      }
    });

    console.log(expandedLoadAmounts);

    if (!loadAmounts.length) {
      return res
        .status(400)
        .json({ message: "Couldn't find data (load amounts)!" });
    }

    const kycData = await db("KycOne")
      .select("id", "first_name", "last_name", "email")
      .limit(required_KYC);

    const kycIds = kycData.map((kyc) => kyc.id);
    const kycDetails = kycData.map(({ id, ...rest }) => rest);

    console.log(kycData, kycIds, kycDetails);

    const phoneData = await db("PhoneNumberOne")
      .select("id", "number")
      .limit(required_KYC);

    const phoneIds = phoneData.map((phone) => phone.id);
    const phoneDetails = phoneData.map(({ id, ...rest }) => rest);

    console.log(phoneData, phoneIds, phoneDetails);

    if (
      kycDetails.length < required_KYC ||
      phoneDetails.length < required_KYC
    ) {
      return res
        .status(400)
        .json({ message: "Insufficient KYC or phone number data" });
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Order File");

    worksheet.columns = [
      { header: "S.No", key: "sno", width: 10 },
      { header: "Load Amount", key: "load_amount", width: 15 },
      { header: "First Name", key: "first_name", width: 15 },
      { header: "Last Name", key: "last_name", width: 15 },
      { header: "Mobile No.", key: "mobile_no", width: 15 },
      { header: "Email Id*", key: "email_id", width: 20 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Bin", key: "bin", width: 15 },
    ];       

    for (let i = 0; i < required_KYC; i++) {
        const trackResult = await trackKycNumIndex(kycIds[i], phoneIds[i]);
    
        if (!trackResult.success) {
            return res.status(400).json({ message: trackResult.message });
        }

      worksheet.addRow({
        sno: i + 1,
        load_amount: expandedLoadAmounts[i]?.load_amount || "",
        first_name: kycDetails[i]?.first_name || "",
        last_name: kycDetails[i]?.last_name || "",
        mobile_no: phoneDetails[i]?.number || "",
        email_id: kycDetails[i]?.email || "",
        dob: today || "",
        bin: bin_name || "",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error.stack);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

const trackKycNumIndex = async (kyc_id, phone_number_id) => {
  try {
    const usageData = await db("PhoneKycOne")
      .select(
        "monthly_count_kyc",
        "yearly_count_kyc",
        "monthly_count_number",
        "yearly_count_number"
      )
      .where({ kyc_id, phone_number_id })
      .first();

    if (!usageData) {
      await db("PhoneKycOne").insert({
        kyc_id,
        phone_number_id,
        monthly_count_kyc: 1,
        yearly_count_kyc: 1,
        monthly_count_number: 1,
        yearly_count_number: 1,
      });

      return { success: true, message: 'New usage entry created and tracked' };
    }

    if (usageData.monthly_count_kyc >= max_monthly_kyc) {
        return { success: false, message: 'Monthly KYC limit exceeded for this bin' };
    }
    if (usageData.yearly_count_kyc >= max_yearly_kyc) {
        return { success: false, message: 'Yearly KYC limit exceeded for this bin' };
    }
    if (usageData.monthly_count_number >= max_monthly_number) {
        return { success: false, message: 'Monthly Phone Number limit exceeded for this bin' };
    }
    if (usageData.yearly_count_number >= max_yearly_number) {
        return { success: false, message: 'Yearly Phone Number limit exceeded for this bin' };
    }

    await db('PhoneKycOne')
            .where({ kyc_id, phone_number_id })
            .update({
                monthly_count_kyc: db.raw('monthly_count_kyc + 1'),
                yearly_count_kyc: db.raw('yearly_count_kyc + 1'),
                monthly_count_number: db.raw('monthly_count_number + 1'),
                yearly_count_number: db.raw('yearly_count_number + 1'),
                updated_at: db.fn.now()
            });

    console.log("Usage tracked!");

    return { success: true, message: 'Usage tracked successfully' };
  } catch (error) {
    console.log(error.stack);
    return {status: 500, message: "Internal server error!"};
  }
};
