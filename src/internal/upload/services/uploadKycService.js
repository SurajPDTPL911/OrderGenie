import exceljs from 'exceljs';

const headersKyc = [ 'First name', 'Middle name', 'Last name', 'Email' ];
const headersNum = ['Phone number'];

function validateHeaders (checkHeaders, checkedAgainstHeeader) {
    try {
        let isValid = checkHeaders.every((col) => checkedAgainstHeeader.includes(col));
    return isValid;
    } catch (error) {
        console.log(`error: Here in vaidateHeaders block ----> ${error.stack}`);
        return res.status(500).json({message: error.message});
    }
};

export const parseExcelPKyc = async (filepath) => {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filepath);
    const worksheet = workbook.getWorksheet(1);

    const headerRow = worksheet.getRow(1).values.slice(1);
    console.log(headerRow);
    console.log(headersKyc);
    let isValid = validateHeaders(headerRow, headersKyc);

    if (!isValid) {
        throw new Error('Invalid XLSX Headers! Expected: ' + headers.join(', '));
    }

    const data = [];
    worksheet.eachRow((row, rowNumber) => {
        if(rowNumber > 1){
            data.push({
                first_name: row.getCell(1).value,
                middle_name: row.getCell(2).value || null,
                last_name: row.getCell(3).value,
                email: row.getCell(4).value
            })
        }
    })

    return data;
}

export const parseExcelPNum = async(filepath) => {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filepath);
    const worksheet = workbook.getWorksheet(1);

    const headerRow = worksheet.getRow(1).values.slice(1);
    console.log(headerRow);
    console.log(headersNum);

    let isValid = validateHeaders(headerRow, headersNum);

    if(!isValid){
        throw new Error('Invalid XLSX Headers! Expected: ' + headers.join(', '));
    }

    const data = [];
    worksheet.eachRow((row, rowNumber) => {
        if(rowNumber > 1){
            data.push({
                number: row.getCell(1).value
            })
        }
    })

    return data;
}


