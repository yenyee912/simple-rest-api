const shopifyOrder = require("../../models/shopify/Shopify.js");

var path = require("path");
var handlebars = require("handlebars");
var fs = require("fs");

const puppeteer = require("puppeteer");
const {
    request
} = require("http");

handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": (lvalue + rvalue).toFixed(2),
        "*": (lvalue * rvalue).toFixed(2),
    }[operator];
});

exports.createDeliveryNote = async (req, res) => {
    let requestData = await shopifyOrder.findOne({ orderNumber: req.params.orderNumber })
    try {        
        host = req.get("host");
        var html = fs.readFileSync("./app/mongoose/mailTemplate/deliveryNoteTemplate.hbs","utf8");        
        var template = handlebars.compile(html);

        var replacements = {
            orderDate: requestData.orderDate,
            deliveryDate: requestData.deliveryDate,
            orderNumber: requestData.orderNumber,

            customerName: requestData.shipping.customerName,
            company: requestData.shipping.company,
            address1: requestData.shipping.address1,
            address2: requestData.shipping.address2,
            zip: requestData.shipping.zip,
            city: requestData.shipping.city,
            province: requestData.shipping.province,
            email: requestData.email,
            phone: requestData.shipping.phone,

            note: requestData.note,

            items: requestData.items,
            content: requestData.content
        };

        var emailTemplate = template(replacements, {
            allowProtoMethodsByDefault: true,
            allowProtoPropertiesByDefault: true,
        });

        var pdfTemplate = encodeURIComponent(emailTemplate);

        const browser = await puppeteer.launch({
            product: "chrome",
            args: ["--no-sandbox"],
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto(`data:text/html;charset=UTF-8,${pdfTemplate}`, {
            waitUntil: "networkidle0",
        });

        var options = {
            format: "A4",
            headerTemplate: "<p></p>",
            footerTemplate: "<p></p>",
            displayHeaderFooter: false,
            margin: {
                top: "40px",
                bottom: "100px",
            },
            printBackground: true,
            path: `./app/mongoose/mailTemplate/shopifyDO.pdf`,
        };
        await page.pdf(options);

        await browser.close();
        console.log(`Done:shopifyDO.pdf is created!`);
        res.sendFile(path.join(__dirname, "../../mailTemplate", "shopifyDO.pdf"));
    } 

    catch (err) {
        console.log(err);
        res.status(500).send({
            message: err,
        });
    }
}