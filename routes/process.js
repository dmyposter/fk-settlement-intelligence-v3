const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
}

const parseOrderFile =
require("../services/orderParser");

const parsePaymentFiles =
require("../services/paymentParser");

const processSettlement =
require("../services/settlementProcessor");

const router =
express.Router();

const storage =
multer.diskStorage({

    destination:
    (req,file,cb)=>{

        cb(
            null,
            "uploads/"
        );

    },

    filename:
    (req,file,cb)=>{

        cb(
            null,
            Date.now()
            + "-"
            + file.originalname
        );

    }

});

const upload =
multer({
    storage
});

router.post(

"/process",

upload.fields([

{
    name:"ordersFile",
    maxCount:1
},

{
    name:"paymentFiles",
    maxCount:50
}

]),

async(
    req,
    res
)=>{

try{

    console.log(
        "\n========== V3 START =========="
    );

    // =====================================
    // ORDER REPORT
    // =====================================

    const ordersPath =
    req.files
    .ordersFile[0]
    .path;

    const ordersData =
    parseOrderFile(
        ordersPath
    );

    // =====================================
    // PAYMENT REPORTS
    // =====================================

    const paymentFiles =
    req.files
    .paymentFiles || [];

    const paymentData =
    parsePaymentFiles(
        paymentFiles
    );

    // =====================================
    // PROCESS
    // =====================================

    const result =
    await processSettlement(

        ordersData,

        paymentData

    );

    // =====================================
    // EXPORT
    // =====================================

    const workbook =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(
            result.summary
        ),

        "Summary"

    );

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(
            result.consolidatedOrders
        ),

        "Consolidated Orders"

    );

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(
            result.goldData
        ),

        "Gold Data"

    );

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(
            result.orderAnalysis
        ),

        "Order Analysis"

    );

    XLSX.utils.book_append_sheet(

        workbook,

        XLSX.utils.json_to_sheet(
            result.skuAnalysis
        ),

        "SKU Analysis"

    );

    const fileName =

    `FK_Report_${
        Date.now()
    }.xlsx`;

    const reportPath =

    path.join(

        __dirname,

        "../reports",

        fileName

    );

    XLSX.writeFile(

        workbook,

        reportPath

    );

    console.log(
        "\n========== DONE =========="
    );

    res.json({

    success: true,

    file: fileName,

    ordersRows:
    ordersData.length,

    paymentRows:
    paymentData.length,

    consolidatedRows:
    result.consolidatedOrders.length,

    goldDataRows:
    result.goldData.length,

    skuAnalysisRows:
    result.skuAnalysis.length

});

}
catch(error){

    console.log(
        error
    );

    res.status(500).json({

        success:false,

        message:
        error.message

    });

}

});

module.exports =
router;