const seedInv = require("../../models/seedInventory/SeedInventory.js");
var dataStore = require("../../dataStore.js")
const _ = require("lodash");
const nodemailer = require("nodemailer");
const moment = require("moment");

var handlebars = require("handlebars");
require("dotenv").config();

var fs = require("fs");

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

async function generateEmail(cultivarList, locationName, notifyEmail) {
    var html = fs.readFileSync(
        "./app/mongoose/mailTemplate/inventoryAlertTemplate.hbs", "utf8"
    );
    var template = handlebars.compile(html);

    var replacements = {
        checkDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        locationName: locationName.toUpperCase(),
        lowCultivar: cultivarList,
    };

    let emailTemplate = template(replacements, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
    });

    var mail = {
        from: process.env.MAIL_ADDRESS,
        to: notifyEmail,
        subject: "Low Seed Inventory Alert",
        text: "Please check the seed inevntory for cultivars below: ",
        html: emailTemplate,
    };

    transporter.sendMail(mail, function (err, info) {
        if (err) {
            console.log(err);
        }

        transporter.close();
    });

}

async function checkInventory(locationId, minLevel) {
    //status: 0 - inactive, 1 - expired, 2 - discard, 3 - in-transit,
    //4- active, 5 -in-farm, 6 - in-use, 7-other

    let matchFilter = {}
    let groupItem = {}

    matchFilter['status'] = { $gt: parseInt(3) }
    matchFilter['currentLocation'] = { $eq: parseInt(locationId) }

    // console.log(matchFilter)

    // _id
    groupItem = {
        seedId: "$seedId",
        cultivarId: "$cultivarId",
    }

    const x = await seedInv.aggregate([
        {
            $match: matchFilter
        },
        {
            $group: {
                _id: groupItem,
                quantity: { $sum: 1 } //+=1
            }
        },
    ])

    try {
        let filteredList = []
        if (x.length > 0) {
            filteredList = x.filter(obj => { return obj.quantity <= minLevel })
        }

        return filteredList

    }

    catch (err) {
        console.log(err.message)
    }

}

// req, res used to trigger one mail only later
exports.triggerAllAlert = async () => {
    let allLocation = await dataStore.allLocation()
    try {
        for (let i = 1; i < allLocation.length; i++) {
            // get the low seed inventory list
            let result = await checkInventory(allLocation[i].id, allLocation[i].alert)

            // pass to generate email    
            if (result.length > 0 && allLocation[i].isSubscribe === true){
                let formattedList = await Promise.all(result.map(async item => {
                    let cultivarName = await dataStore.bindCultivarInfo(item._id.cultivarId)
                    return {
                        seedId: item._id.seedId,
                        cultivarId: item._id.cultivarId,
                        quantity: item.quantity,
                        cultivar: cultivarName.name
                    }
                }))

                await generateEmail(formattedList, allLocation[i].location, allLocation[i].subscriptionMail)

            }
        }

    }

    catch (err) {
        console.log(`Error: ${err.message}`)
    }
};


exports.triggerManualAlert = async (req, res) => {
    let recipientEmail = req.query.email

    let allLocation = await dataStore.allLocation()
    try {
        let target = allLocation.filter(obj => { return obj.id == req.query.location })[0]
        if (target) {

            // pass list, location name and minimum level to check
            let resultList = await checkInventory(target.id, target.alert)

            if (resultList.length > 0) {
                let formattedList = await Promise.all(resultList.map(async item => {
                    let cultivarName = await dataStore.bindCultivarInfo(item._id.cultivarId)
                    return {
                        seedId: item._id.seedId,
                        cultivarId: item._id.cultivarId,
                        quantity: item.quantity,
                        cultivar: cultivarName.name
                    }
                }))

                await generateEmail(formattedList, target.location, recipientEmail)
                try {
                    res.status(200).send({ msg: `Email sent. Please check your email= ${recipientEmail}.` })
                }

                catch (err) {
                    res.status(500).send({ msg: `Error while sending alert email: ${err.message}.` });
                }
            }

            else{
                res.status(200).send({ msg: `No email.` })
            }
        }

        else{
            res.status(200).send({msg: `No farm/ location with id= ${req.query.location}. Please check again.`})
        }
    }

    catch (err) {
        res.status(500).send({ msg: `Error while sending alert email: ${err.message}.` });
    }
};