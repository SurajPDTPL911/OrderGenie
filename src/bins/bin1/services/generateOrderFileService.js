import exceljs from "exceljs";
import db from "../../../config/knexClient.js";
import {
  validateAndFetchKycAndNum,
  getKyc,
  getNum,
} from "../../../internal/validation/services/validationService.js";

const max_monthly_kyc = 100;
const max_yearly_kyc = 1200;
const max_monthly_number = 10000;
const max_yearly_number = 10000;

const fetchKycData = async (limit) => {
  return await db("KycOne as k")
    .select(  
      "k.id",
      "k.first_name",
      "k.last_name",
      "k.email",
      db.raw("COALESCE(p.monthly_count_kyc, 0) AS total_monthly_usage")
    )
    .leftJoin("PhoneKycOne as p", "k.id", "p.kyc_id")
    .whereRaw("COALESCE(p.monthly_count_kyc, 0) < ?", [max_monthly_kyc])
    .limit(limit);
};

const fetchNumData = async (limit) => {
  return await db("PhoneNumberOne as k")
    .select(
      "k.id",
      "k.number",
      db.raw("COALESCE(p.monthly_count_number, 0) AS total_monthly_usage")
    )
    .leftJoin("PhoneKycOne as p", "k.id", "p.kyc_id")
    .whereRaw("COALESCE(p.monthly_count_kyc, 0) < ?", [max_monthly_kyc])
    .limit(limit);
};

const updateCount = async (kyc_id, phone_number_id) => {
  const existingRecord = await db("PhoneKycOne")
    .where({ kyc_id, phone_number_id })
    .first();

  if (!existingRecord) {
    await db("PhoneKycOne").insert({
      kyc_id,
      phone_number_id,
      monthly_count_kyc: 1,
      yearly_count_kyc: 1,
      monthly_count_number: 1,
      yearly_count_number: 1,
    });
  } else {
    await db("PhoneKycOne")
      .where({ kyc_id, phone_number_id })
      .update({
        monthly_count_kyc: db.raw("monthly_count_kyc + 1"),
        yearly_count_kyc: db.raw("yearly_count_kyc + 1"),
        monthly_count_number: db.raw("monthly_count_number + 1"),
        yearly_count_number: db.raw("yearly_count_number + 1"),
        updated_at: db.fn.now(),
      });
  }

  return { status: 200, message: "Updated Indexes!" };
};

const getCardVendor = async(cardVendor_id) => {
    return await db('CardVendor').select('vendor_name').where({id: cardVendor_id});
}

const getCardBank = async(cardBank_id) => {
    return await db('CardBank').select('bank_name').where({id: cardBank_id});
}

const getCardNetwork = async(cardNetwork_id) => {
    return await db('CardNetwork').select('network_name').where({id: cardNetwork_id});
}

export const generateExcel = async (id) => {
  try {
    const fileData = await db("OrderFileOne")
      .select(
        "filename",
        "CardVendor_id",
        "CardBank_id",
        "CardNetwork_id",
        "required_KYC"
      )
      .where({ id: id });

      console.log(fileData);

    const today = new Date().toISOString().split("T")[0];

    const { CardVendor_id, CardBank_id, CardNetwork_id } = fileData[0];

    const cardVendor = await getCardVendor(CardVendor_id);
    const cardBank = await getCardBank(CardBank_id);
    const cardNetwork = await getCardNetwork(CardNetwork_id)

    console.log(cardVendor);
    
    if (!fileData.length) {
      return { status: 400, message: "Couldn't find data!" };
    }

    const { filename, required_KYC } = fileData[0];

    console.log(filename);

    const orderFileData = await db("OrderFileDataOne")
      .select("load_amount_card", "load_amount", "bin")
      .where({ order_file_id: id });

    const bin_name = orderFileData[0].bin;

    const loadAmounts = orderFileData.map(
      ({ load_amount_card, load_amount }) => ({ load_amount_card, load_amount })
    );

    let expandedLoadAmounts = [];

    loadAmounts.forEach(({ load_amount, load_amount_card }) => {
      for (let j = 0; j < load_amount_card; j++) {
        expandedLoadAmounts.push({ load_amount });
      }
    });

    console.log(`Hello from Load amounts: ${expandedLoadAmounts}, message ends here !`);

    if (!loadAmounts.length) {
      return { status: 400, message: "Couldn't find data (load amounts)!" };
    }

    const utrFileData = await db("UtrDetailOne")
    .select("utr_number", "utr_amount")
    .where({ order_file_id: id });

    let utrLoadAmount = 0;

    for (const utr of utrFileData) {
      utrLoadAmount += utr.utr_amount;
    }

    const validateResponse = await validateAndFetchKycAndNum(
      required_KYC,
      bin_name
    );
    console.log(validateResponse);

    let kycData = await fetchKycData(required_KYC);

    if (kycData.length < required_KYC) {
      console.log("In the if statement!");
      const kycToGet = required_KYC - kycData.length;
      const getKycResponse = await getKyc(kycToGet, bin_name);
      console.log(getKycResponse);

      const additionalKycData = await fetchKycData(kycToGet);
      kycData = [...kycData, ...additionalKycData];
    }

    console.log(kycData.slice(0, 3));

    const kycIds = kycData.map((kyc) => kyc.id);
    const kycDetails = kycData.map(
      ({ id, total_monthly_usage, ...rest }) => rest
    );

    console.log(kycIds.slice(0, 3), kycDetails.slice(0, 3));

    let phoneData = await fetchNumData(required_KYC);

    if (phoneData.length < required_KYC) {
      console.log("In the if statement!");
      const numToGet = required_KYC - phoneData.length;
      const getNumResponse = await getNum(numToGet, bin_name);
      console.log(getNumResponse);

      const additionalphoneData = await fetchNumData(numToGet);
      phoneData = [...phoneData, ...additionalphoneData];
    }

    const phoneIds = phoneData.map((phone) => phone.id);
    const phoneDetails = phoneData.map(
      ({ id, total_monthly_usage, ...rest }) => rest
    );

    console.log(phoneIds.slice(0, 3), phoneDetails.slice(0, 3));

    if (
      kycDetails.length < required_KYC ||
      phoneDetails.length < required_KYC
    ) {
      return { status: 400, message: "Insufficient KYC or phone number data" };
    }

    const cardType = `${cardBank[0].bank_name} ${cardNetwork[0].network_name}(Virtual)`;

    console.log(cardType);

    const workbook = new exceljs.Workbook();
    const worksheet1 = workbook.addWorksheet("Sheet 1");

    worksheet1.columns = [
      { header: "S.No", key: "sno", width: 10, style: { alignment: { horizontal: 'center' } } },
      { header: "First Name", key: "first_name", width: 15, style: { alignment: { horizontal: 'center' } } }, 
      { header: "Last Name", key: "last_name", width: 15, style: { alignment: { horizontal: 'center' } } },  
      { header: "Mobile No.", key: "mobile_no", width: 20, style: { alignment: { horizontal: 'center' } } },    
      { header: "Email Id*", key: "email_id", width: 25, style: { alignment: { horizontal: 'center' } } },    
      { header: "DOB", key: "dob", width: 15, style: { alignment: { horizontal: 'center' } } },    
      { header: "Bin", key: "bin", width: 15, style: { alignment: { horizontal: 'center' } } },    
    ];

    for (let i = 0; i < required_KYC; i++) {
      await updateCount(kycIds[i], phoneIds[i]);

      worksheet1.addRow({
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

    const headerRow = worksheet1.getRow(1);
      headerRow.eachCell(cell => {
          cell.font = { bold: true };
          cell.border = { 
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
      });

      for(let i = 1; i <= required_KYC + 1; i++){
        const dataRow = worksheet1.getRow(i);
          dataRow.eachCell(cell => {
            cell.border = { 
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
          };
          });
      }

    const worksheet2 = workbook.addWorksheet("sheet 2");

    let TotalAmount = 0
    let countRows = 0
    
    worksheet2.addRow(['Legal Name', 'Paramotor Digital Technology', '']);
    worksheet2.addRow(['', today, '']);
    worksheet2.addRow(['Card Type', cardType, '']);
    worksheet2.addRow(['Loading Amount', utrLoadAmount, '']);
    worksheet2.addRow(['Number Of Cards', required_KYC, '']);

    for(const { utr_number, utr_amount } of utrFileData){
      countRows += 1;
      TotalAmount += utr_amount;
      worksheet2.addRow(['UTR Details', utr_number, utr_amount]);
    }

    worksheet2.addRow(['', 'Total', TotalAmount]);

    for (let i = 1; i <= required_KYC + 1; i++) {
      const dataRow = worksheet2.getRow(i);
      dataRow.eachCell((cell, colIndex) => {
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        worksheet2.getColumn(colIndex).width = 25;
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return { status: 200, buffer };
  } catch (error) {
    console.log(error.stack);
    return { status: 500, message: "Internal Server error from service!" };
  }
};


