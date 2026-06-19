async function processSettlement(
    ordersData,
    paymentData
) {

    // =====================================
    // STEP 1
    // CONSOLIDATE PAYMENT BY ORDER ID
    // =====================================

    const paymentMap = {};

    paymentData.forEach(row => {

        const orderId =
        String(
            row.orderId || ""
        ).trim();

        if (!orderId)
            return;

        if (!paymentMap[orderId]) {

            paymentMap[orderId] = {

                settlement: 0,

                saleAmount: 0,

                qty: 0,

                asp: 0

            };

        }

        paymentMap[orderId].settlement +=
        Number(
            row.settlement || 0
        );

        paymentMap[orderId].saleAmount +=
        Number(
            row.saleAmount || 0
        );

        paymentMap[orderId].qty +=
        Number(
            row.qty || 0
        );

    });

    // =====================================
    // RECALCULATE ASP
    // =====================================

    Object.keys(
        paymentMap
    ).forEach(orderId => {

        const row =
        paymentMap[orderId];

        row.asp =
        row.qty > 0

        ? row.saleAmount / row.qty

        : row.saleAmount;

    });

    // =====================================
    // CONSOLIDATED ORDERS
    // =====================================

    const consolidatedOrders =
    Object.keys(
        paymentMap
    ).map(orderId => ({

        "Order ID":
        orderId,

        "Settlement":
        Number(
            paymentMap[
                orderId
            ].settlement.toFixed(2)
        ),

        "Sale Amount":
        Number(
            paymentMap[
                orderId
            ].saleAmount.toFixed(2)
        ),

        "ASP":
        Number(
            paymentMap[
                orderId
            ].asp.toFixed(2)
        )

    }));

    // =====================================
    // STEP 2
    // ORDER ANALYSIS
    // =====================================

    const orderAnalysis = [];

    let matchedOrders = 0;

    ordersData.forEach(order => {

        const orderId =
        String(
            order["ORDER ID"] || ""
        ).trim();

        const payment =
        paymentMap[
            orderId
        ];

        const settlement =
        payment
        ? payment.settlement
        : 0;

        const asp =
        payment
        ? payment.asp
        : 0;

        if (
            settlement !== 0
        ){
            matchedOrders++;
        }

        orderAnalysis.push({

            "Order ID":
            orderId,

            "Date":
            order["DATE"],

            "Status":
            order["STATUS"],

            "SKU":
            order["SKU"],

            "FSN":
            order["FSN"],

            "Qty":
            Number(
                order["QTY"] || 0
            ),

            "ASP":
            Number(
                asp.toFixed(2)
            ),

            "Settlement":
            Number(
                settlement.toFixed(2)
            )

        });

    });

    // =====================================
    // STEP 3
    // GOLD DATA
    // =====================================

    const goldData =
    orderAnalysis.filter(
        row => {

            const settlement =
            Number(
                row.Settlement || 0
            );

            return !(

                settlement >= -10 &&
                settlement <= 10

            );

        }
    );

    // =====================================
    // STEP 4
    // SKU ANALYSIS
    // =====================================

    const skuMap = {};

    goldData.forEach(row => {

        const sku =
        String(
            row.SKU || ""
        ).trim();

        if (!sku)
            return;

        if (!skuMap[sku]) {

            skuMap[sku] = {

                fsn:
                row.FSN,

                orders: 0,

                qty: 0,

                settlement: 0,

                asp: 0

            };

        }

        skuMap[sku].orders++;

        skuMap[sku].qty +=
        Number(
            row.Qty || 0
        );

        skuMap[sku].settlement +=
        Number(
            row.Settlement || 0
        );

        skuMap[sku].asp +=
        Number(
            row.ASP || 0
        );

    });

    const skuAnalysis = [];

    Object.keys(
        skuMap
    ).forEach(sku => {

        const item =
        skuMap[sku];

        skuAnalysis.push({

            "FSN":
            item.fsn,

            "SKU":
            sku,

            "Orders":
            item.orders,

            "Qty":
            item.qty,

            "Avg ASP":
            Number(
                (
                    item.asp /
                    item.orders
                ).toFixed(2)
            ),

            "Total Settlement":
            Number(
                item.settlement.toFixed(2)
            ),

            "Avg Settlement":
            Number(
                (
                    item.settlement /
                    (
                        item.qty || 1
                    )
                ).toFixed(2)
            )

        });

    });

    // =====================================
    // SUMMARY
    // =====================================

    const summary = [

        {
            Metric:
            "Total Orders",

            Value:
            ordersData.length
        },

        {
            Metric:
            "Matched Orders",

            Value:
            matchedOrders
        },

        {
            Metric:
            "Gold Orders",

            Value:
            goldData.length
        }

    ];

    console.log(
        "\n========== PROCESS RESULT =========="
    );

    console.log(
        "Orders:",
        ordersData.length
    );

    console.log(
        "Payments:",
        paymentData.length
    );

    console.log(
        "Matched:",
        matchedOrders
    );

    console.log(
        "Gold:",
        goldData.length
    );

    console.log(
        "SKU:",
        skuAnalysis.length
    );

    return {

        summary,

        consolidatedOrders,

        orderAnalysis,

        goldData,

        skuAnalysis

    };

}

module.exports =
processSettlement;