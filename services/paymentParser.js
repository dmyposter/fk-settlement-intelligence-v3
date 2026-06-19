const XLSX = require("xlsx");

function parsePaymentFiles(files) {

    let paymentData = [];

    files.forEach(file => {

        console.log(
            `Reading Payment File: ${file.originalname}`
        );

        const workbook =
        XLSX.readFile(file.path);

        const sheet =
        workbook.Sheets["Orders"];

        if (!sheet) {

            console.log(
                `Orders sheet not found in ${file.originalname}`
            );

            return;

        }

        const rows =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: ""
            }
        );

        // Row 2 = Headers
        const headers =
        rows[1];

        for (
            let i = 3;
            i < rows.length;
            i++
        ) {

            const row =
            rows[i];

            if (
                !row ||
                row.length === 0
            ) continue;

            const obj = {};

            headers.forEach(
                (
                    header,
                    index
                ) => {

                    if (
                        header &&
                        String(header).trim() !== ""
                    ) {

                        obj[
                            String(header).trim()
                        ] = row[index];

                    }

                }
            );

            const orderId =
            String(
                obj["Order ID"] || ""
            ).trim();

            if (!orderId)
                continue;

            const settlementKey =
            Object.keys(obj).find(
                key =>
                key.includes(
                    "Bank Settlement Value"
                )
            );

            const settlement =
            Number(
                obj[settlementKey] || 0
            );

            const saleAmount =
            Number(
                obj["Sale Amount (Rs.)"] || 0
            );

            const qty =
            Number(
                obj["Quantity"] || 0
            );

            const asp =
            qty > 0
            ? saleAmount / qty
            : saleAmount;

            paymentData.push({

                orderId,

                settlement,

                saleAmount,

                qty,

                asp,

                sku:
                String(
                    obj["Seller SKU"] || ""
                ).trim(),

                paymentDate:
                obj["Payment Date"] || ""

            });

        }

    });

    console.log(
        "\n========== PAYMENT PARSER =========="
    );

    console.log(
        "Rows:",
        paymentData.length
    );

    console.log(
        "First Row:"
    );

    console.log(
        paymentData[0]
    );

    return paymentData;

}

module.exports =
parsePaymentFiles;