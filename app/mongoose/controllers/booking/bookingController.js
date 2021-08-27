var Booking = require("../../models/booking/Booking");
const User = require("../../models/user/Customer");
const Cultivar = require("../../models/harvest/Cultivar");
var _ = require("lodash");
var moment = require("moment");
var path = require("path");
moment().format();

var dataStore = require("../../dataStore.js")

var allLocation = []
async function getData() {
    allLocation = await dataStore.allLocation()
}
getData()

var nodemailer = require("nodemailer");
require("dotenv").config();

var handlebars = require("handlebars");
var fs = require("fs");

const puppeteer = require("puppeteer");
const {
  request
} = require("http");

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
  } [operator];
});

exports.createNewOrder = async (req, res) => {

    const DO = Date.now();
    var customerData;
    const order = new Booking({
      DO: DO,
      fulfilled: false,
      farmLocation: req.body.farmLocation,
      email: req.body.email,
      orderDate: req.body.orderDate,
      remarks: req.body.remarks,
      booking: req.body.booking,
    });

    var webTotal;
    webTotal = _(order)
      .flatMap("booking")
      .flatMap("itemOrdered")
      .groupBy("id")
      .map((objs, key) => {
        return {
          id: parseInt(key),
          name: _.sumBy(objs, "name"),
          price: _.uniqBy(objs, "price")[0],
          bookingWeight: _.sumBy(objs, "bookingWeight"),
        };
      })
      .dropRight()  // there is an undefined obj at the end of data--> cannot identify the [0].price
      .value();

    webTotal = webTotal.map(el => {
      return {
        id: parseInt(el.id),
        name: el.name,
        price: el.price.price,
        bookingWeight: el.bookingWeight,
        total: parseFloat(el.bookingWeight * el.price.price),
      }
    })

    let profit = _.sumBy(webTotal, function (item) {
      if (!isNaN(item.total)) return item.total;
    });
      
    customerData = await User.findOne({
        email: order.email,
      });

    const x = await order.save();
    try {

      if(x)
        res.status(201).send({
          msg: `Successfully create booking.`,
          data: x
        });
      
      else
        res.status(304).send({ msg: `Unable to create booking. Please try again.` })

    }

    catch (err) {
      res.status(500).send({msg: `Error while creating booking: ${err.message}.`});
    }

    finally {
      try {
        host = req.get("host");
        var html = fs.readFileSync(
          "./app/mongoose/mailTemplate/bookingTemplate.hbs",
          "utf8"
        );
        var template = handlebars.compile(html);

        var replacements = {
          customerID: customerData.organization.slice(0, 6).toUpperCase(),
          orderDate: order.orderDate,
          deliveryDate: order.booking[0].deliveryDate,
          DO: order.DO,
          booking: webTotal,
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
          total: profit.toFixed(2),
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

        var mail = {
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
        // console.log(mail);
        transporter.sendMail(mail, function (err, info) {
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
  const x = await Booking.findByIdAndUpdate(id, req.body, {
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
  
  const data = await Booking.findByIdAndRemove(id);

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

  let target= ''

  if (req.query.location) {
    target = allLocation.filter(obj => { return obj.id == req.query.location })[0]
    if (target)
      queries["farmLocation"] = { $regex: target.location }
    else
      queries["farmLocation"] = -1

    delete queries.location
  }

  // search based on deliveryDate
  if (days.length>0) {
    queries["booking.deliveryDate"] = {
      $in: days,
    };

    delete queries.startDate
    delete queries.endDate
  }
  
  const x = await Booking.find(queries, returningFields).sort({_id: -1});
  try {
    if(x.length>0)
      res.status(200).send({data: x})
    
    else
      res.send({msg: `No data.`})
  } 
  
  catch (err) {
    res.status(500).send({ msg: `Error while retrieving booking: ${err.message}.` }
  );
  }
};


exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;

  const x = await Booking.findOne({ _id: orderId })
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
    let requestData = await Booking.findById(orderId);
 
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
      deliveryDate: requestData.booking[0].deliveryDate,
      DO: requestData.DO,
      booking: requestData.booking[0].itemOrdered,
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
    let requestData = await Booking.findById(orderId)

    let customerData = await User.findOne({
      email: requestData.email,
    });

    var webTotal;
    webTotal = _(requestData)
      .flatMap("booking")
      .flatMap("itemOrdered")
      .groupBy("id")
      .map((objs, key) => {
        return {
          id: parseInt(key),
          name: _.sumBy(objs, "name"),
          price: _.sumBy(objs, "price"),
          receivedWeight: _.sumBy(objs, "receivedWeight"),
        };
      })
      .dropRight()
      .value();

    var cultivarList = await Cultivar.find({});

    var temp = _.intersectionBy(cultivarList, webTotal, "id");

    function calWeight(objValue, srcValue) {
      if (objValue.id == srcValue.id) {
        return {
          id: parseInt(objValue.id),
          name: objValue.name,
          receivedWeight: objValue.receivedWeight,
          price: objValue.price,
          total: parseFloat(objValue.receivedWeight * objValue.price),
        };
      }
    }
    _.mergeWith(webTotal, temp, calWeight);
    
    // console.log(webTotal)
    
    let totalCost = _.sumBy(webTotal, function (cultivar) {
      if (!isNaN(cultivar.total)) return cultivar.total;
    });

    host = req.get("host");
    var html = fs.readFileSync(
      "./app/mongoose/mailTemplate/invoiceTemplate.hbs",
      "utf8"
    );
    var template = handlebars.compile(html);

    var replacements = {
      customerID: customerData.organization.slice(0, 6).toUpperCase(),
      orderDate: requestData.orderDate,
      deliveryDate: requestData.booking[0].deliveryDate,
      DO: requestData.DO,
      booking: requestData.booking[0].itemOrdered,
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