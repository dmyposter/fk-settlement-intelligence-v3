const XLSX = require("xlsx");

function parseOrderFile(filePath){

    const workbook =
    XLSX.readFile(filePath);

    const sheet =
    workbook.Sheets["Orders"];

    if(!sheet){

        throw new Error(
            "Orders sheet not found"
        );

    }

    const rows =
    XLSX.utils.sheet_to_json(
        sheet,
        {
            header:1,
            defval:""
        }
    );

    const headers =
    rows[0];

    const orders = [];

    for(
        let i = 1;
        i < rows.length;
        i++
    ){

        const row =
        rows[i];

        if(
            !row ||
            row.length === 0
        ){
            continue;
        }

        orders.push({

            "ORDER ID":
            String(
                row[1] || ""
            ).trim(),

            "DATE":
            row[4] || "",

            "STATUS":
            row[6] || "",

            "SKU":
            String(
                row[7] || ""
            ).trim(),

            "FSN":
            String(
                row[8] || ""
            ).trim(),

            "TITLE":
            String(
                row[9] || ""
            ).trim(),

            "QTY":
            Number(
                row[10] || 0
            )

        });

    }

    console.log(
        "\n========== ORDER PARSER =========="
    );

    console.log(
        "Rows:",
        orders.length
    );

    console.log(
        orders[0]
    );

    return orders;

}

module.exports =
parseOrderFile;