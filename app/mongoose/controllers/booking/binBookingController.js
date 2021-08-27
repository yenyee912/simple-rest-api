var BinBooking = require("../../models/booking/BinBooking");

const User = require("../../models/user/Customer");
var _ = require("lodash");
var moment = require("moment");
var path = require("path");
var orderid = require('order-id')('mysecret');
// moment().format();

var dataStore = require("../../dataStore.js")

var allLocation = [] // for get all orders
async function getData() {
  allLocation = await dataStore.allLocation()
}
getData()

var nodemailer = require("nodemailer");
require("dotenv").config();

var handlebars = require("handlebars");
var fs = require("fs");

const puppeteer = require("puppeteer");

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_ADDRESS,
    clientId: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    refreshToken: process.env.REFRESHTOKEN,
    accessToken: process.env.ACCESSTOKEN,
  },
});

handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": (lvalue + rvalue).toFixed(2),
    "*": (lvalue * rvalue).toFixed(2),
  }[operator];
});

exports.createNewOrder = async (req, res) => {
  const purchaseOrderNumber = orderid.generate();
  const order = new BinBooking({
    orderDate: req.body.orderDate,
    deliveryDate: req.body.deliveryDate,
    PO: purchaseOrderNumber,
    isFulfilled: false,
    farmLocation: req.body.farmLocation,
    email: req.body.email,
    remarks: req.body.remarks,
    content: req.body.content,
    binCount: req.body.binCount,
    totalPaid: req.body.binCount * 120 
  });

  let customerData = await User.findOne({
    email: order.email,
  });

  const x = await order.save();
  try {

    if (x)
      res.status(201).send({
        msg: `Successfully create booking.`,
        data: x
      });

    else
      res.status(304).send({ msg: `Unable to create booking. Please try again.` })

  }

  catch (err) {
    res.status(500).send({ msg: `Error while creating booking: ${err.message}.` });
  }

  finally {
    try {
      host = req.get("host");
      var html = fs.readFileSync(
        "./app/mongoose/mailTemplate/binBookingTemplate.hbs",
        "utf8"
      );
      var template = handlebars.compile(html);

      var replacements = {
        customerID: customerData.organization.slice(0, 6).toUpperCase(),
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        PO: order.PO,
        content: order.content,
        company: customerData.organization,
        address1: customerData.address1,
        address2: customerData.address2,
        address3: customerData.address3,
        postcode: customerData.postcode,
        city: customerData.city,
        state: customerData.state,
        email: order.email,
        name: customerData.name,
        mobile: customerData.mobile,
        total: order.totalPaid,
        binCount: order.binCount
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
        path: "./app/mongoose/mailTemplate/PO.pdf",
      };
      await page.pdf(options);

      await browser.close();
      console.log("Done: PO.pdf is created!");

      let custMail= {
        from: process.env.MAIL_ADDRESS,
        to: order.email,
        subject: "Your booking has been confirmed",
        text: "Your booking has been confirmed",
        html: emailTemplate,
        attachments: [{
          filename: "PO.pdf",
          path: "./app/mongoose/mailTemplate/PO.pdf",
        },],
      };

      let staffMail= {
        from: process.env.MAIL_ADDRESS,
        to: process.env.STAFF_MAIL_ADDRESS,
        subject: "New B2B Booking (Bin Booking)",
        text: "Please login to FarmOS to process the order.",
      }
      
      transporter.sendMail(custMail, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          // see https://nodemailer.com/usage
          console.log("info.messageId: " + info.messageId);
          console.log("info.envelope: " + info.envelope);
          console.log("info.accepted: " + info.accepted);
          console.log("info.response: " + info.response);
        }
        transporter.close();
      });

      transporter.sendMail(staffMail, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          // see https://nodemailer.com/usage
          console.log("info.messageId: " + info.messageId);
          console.log("info.envelope: " + info.envelope);
          console.log("info.accepted: " + info.accepted);
          console.log("info.response: " + info.response);
        }
        transporter.close();
      });
    } catch (err) {
      console.log(err);
    }
  }// ./end-finally
};

exports.updateOrderById = async (req, res) => {

  const id = req.params.id;
  const x = await BinBooking.findByIdAndUpdate(id, req.body, {
    upsert: false,
    useFindAndModify: false,
    returnOriginal: false
  });

  try {

    if (!x) {
      res.status(503).send({
        msg: `Unable to update booking with id= ${id}. Please try again.`,
      });
    }

    else {
      res.status(201).send({
        msg: `Successfully update booking with id= ${id}.`,
        data: x
      });
    }
  }

  catch (err) {
    res.status(500).send({
      msg: `Error while updating booking with id= ${id}: ${err.message}.`,
    });
  }
};

exports.deleteOneById = async (req, res) => {
  const id = req.params.id;

  const data = await BinBooking.findByIdAndRemove(id);

  try {
    if (!data) {
      res.status(503).send({
        msg: `Unable to delete booking with id= ${id}. Please try again. `,
      });
    }

    else {
      res.status(200).send({
        msg: `Successfully deleted booking with id= ${id}.`,
      });
    }
  }


  catch (err) {
    res.status(500).send({
      msg: "Could not delete booking with id=" + id,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  let returningFields = ''
  if (req.query.fields) {
    let regex = /,/g
    returningFields = req.query.fields.replace(regex, ' ')
  }

  let queries = req.query
  delete queries.fields

  const startDate = moment(req.query.startDate, "YYYY-MM-DD");
  const endDate = moment(req.query.endDate, "YYYY-MM-DD");

  var startOfWeek = moment(startDate, "MM-DD-YYYY");
  var endOfWeek = moment(endDate, "MM-DD-YYYY");

  var days = [];
  var day = startOfWeek;

  while (day <= endOfWeek) {
    days.push(day.format("MM-DD-YYYY"));
    day = day.clone().add(1, "d");
  }

  let target = ""

  if (req.query.location) {
    target = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    if (target)
      queries["farmLocation"] = { $regex: target.location }
    else
      queries["farmLocation"] = -1

    delete queries.location
  }

  // search based on orderDate
  if (days.length > 0) {
    queries["booking.orderDate"] = {
      $in: days,
    };

    delete queries.startDate
    delete queries.endDate
  }
  try {
    const x = await BinBooking.find(queries, returningFields).sort({ _id: -1 });

    if (x.length > 0)
      res.status(200).send({ data: x })

    else
      res.send({ msg: `No data.` })
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving booking: ${err.message}.` }
    );
  }
};


exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;

  const x = await BinBooking.findOne({ _id: orderId })
  try {
    if (x) {
      res.status(200).send({ data: x })
    }

    else {
      res.status(200).send({ msg: `No data.` });
    }
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving booking with id= ${orderId}: ${err.message}.` });
  }
};

exports.createDO = async (req, res) => {
  const orderId = req.params.id;

  try {
    let requestData = await BinBooking.findById(orderId);

    let customerData = await User.findOne({
      email: requestData.email,
    });

    host = req.get("host");
    var html = fs.readFileSync(
      "./app/mongoose/mailTemplate/deliveryOrder.hbs",
      "utf8"
    );
    var template = handlebars.compile(html);

    var replacements = {
      customerID: customerData.organization.slice(0, 6).toUpperCase(),
      orderDate: requestData.orderDate,
      deliveryDate: requestData.booking.deliveryDate,
      DO: requestData.DO,
      booking: requestData.booking.content,
      company: customerData.organization,
      address1: customerData.address1,
      address2: customerData.address2,
      address3: customerData.address3,
      postcode: customerData.postcode,
      city: customerData.city,
      state: customerData.state,
      email: requestData.email,
      name: customerData.name,
      mobile: customerData.mobile,
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
      path: "./app/mongoose/mailTemplate/DO.pdf",
    };
    await page.pdf(options);

    await browser.close();
    console.log("Done: DO.pdf is created!");
    res.sendFile(path.join(__dirname, "../../mailTemplate", "DO.pdf"));
  } catch (err) {
    res.status(500).send(
      { msg: `Error while creating DO.pdf with id= ${orderId}: ${err.message}.` }
    );
  }
};

exports.createInvoice = async (req, res) => {
  const orderId = req.params.id;

  try {
    let requestData = await BinBooking.findById(orderId)

    let customerData = await User.findOne({
      email: requestData.email,
    });

    host = req.get("host");
    var html = fs.readFileSync(
      "./app/mongoose/mailTemplate/binBookingInvoiceTemplate.hbs",
      "utf8"
    );
    var template = handlebars.compile(html);

    var replacements = {
      customerID: customerData.organization.slice(0, 6).toUpperCase(),
      orderDate: requestData.orderDate,
      deliveryDate: requestData.booking.deliveryDate,
      DO: requestData.DO,
      booking: requestData.booking.content,
      company: customerData.organization,
      address1: customerData.address1,
      address2: customerData.address2,
      address3: customerData.address3,
      postcode: customerData.postcode,
      city: customerData.city,
      state: customerData.state,
      email: requestData.email,
      name: customerData.name,
      mobile: customerData.mobile,
      total: totalCost.toFixed(2),
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
      path: "./app/mongoose/mailTemplate/Invoice.pdf",
    };
    await page.pdf(options);

    await browser.close();
    res.sendFile(path.join(__dirname, "../../mailTemplate", "Invoice.pdf"));
  } catch (err) {
    res.status(500).send(
      { msg: `Error while creating Invoice.pdf with id= ${orderId}: ${err.message}.` }
    );
  }
};