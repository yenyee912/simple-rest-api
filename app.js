var express = require("express");
var passport = require("passport");
const methodOverride = require("method-override");
var cron = require('node-cron');
var morgan = require('mongoose-morgan');
const moment = require('moment');

var app = express();

// Mongoose API
var staffApi = require("./app/mongoose/routes/user/staffRoute");
var customerApi = require("./app/mongoose/routes/user/customerRoute");
var userApi = require("./app/mongoose/routes/user/userRoute");
var harvestApi = require("./app/mongoose/routes/harvest/harvestRoute");
var cultivarApi = require("./app/mongoose/routes/harvest/cultivarRoute");
var bookingApi = require("./app/mongoose/routes/booking/bookingRoute");
var binBookingApi = require("./app/mongoose/routes/booking/binBookingRoute");
var seedApi = require("./app/mongoose/routes/seedInventory/seedRoute")
var seedInventoryApi = require("./app/mongoose/routes/seedInventory/seedInventoryRoute")
var locationApi = require("./app/mongoose/routes/seedInventory/locationRoute")
var alert = require("./app/mongoose/controllers/seedInventory/alertController")
var shopifyApi = require("./app/mongoose/routes/shopify/shopifyRoute")

// Body Parser
app.use(express.json({ limit: "1mb" }));
app.use(
    express.urlencoded({
        extended: false,
    })
);

// Logging
// app.use(morgan("combined"));

// Passport Config
require("./app/mongoose/config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS
var corsMiddleware = function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*"); //replace localhost with actual host
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, PUT, PATCH, POST, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Requested-With, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    if ("OPTIONS" == req.method) {
        res.sendStatus(200);
    } else next();
};
app.use(corsMiddleware);
app.use(methodOverride("_method"));
require("dotenv").config();

// Set up mongoose connection
var mongoose = require("mongoose");
const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

mongoose
    .connect(mongoURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        auth: {
            authSource: "admin"
        }
    })
    .then(() => console.log(`${process.env.MONGO_DB} connected`));
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// save requests to DB
app.use(morgan({
    collection: 'os.request_logger',
    connectionString: mongoURI,
},
    {},
    'combined'
));

// Upload middleware: multer
// temp is to store user uplaod files & images--without validation
// 1st arg: virtual path, 2nd: actual path(just state the folder name), without dash; root
app.use('/temp', express.static('temp'));
app.use('/images', express.static('images'));

// routes
app.use("/api/v1/customer", customerApi);
app.use("/api/v1/user", staffApi); // change to staff
app.use("/api/v1/users", passport.authenticate("jwt", { session: false }), userApi);

app.use("/api/v1/cultivars", passport.authenticate("jwt", { session: false }), cultivarApi);

app.use("/api/v1/booking", passport.authenticate("jwt", { session: false }), bookingApi);
app.use("/api/v1/bin_booking", binBookingApi);

app.use("/api/v1/harvest", passport.authenticate("jwt", { session: false }), harvestApi);

app.use("/api/v1/seeds", passport.authenticate("jwt", { session: false }), seedApi)
app.use("/api/v1/seed_inventory", passport.authenticate("jwt", { session: false }), seedInventoryApi)

app.use("/api/v1/locations", passport.authenticate("jwt", { session: false }), locationApi)

app.use("/api/v1/shopify", passport.authenticate("jwt", { session: false }), shopifyApi)

// seed inventory alert
cron.schedule('0 5 */14 * *', () => { //every 14 days at 5am
    alert.triggerAllAlert()
    console.log(`--sent--`)
});

// Welcome msg on browser
app.get("/api/v1", (req, res) => {
    res.json({ message: "Welcome to simple-rest-api." });
});

// Testing msg
app.listen(process.env.PORT, () => {
    console.log("Server is up and running on port number " + process.env.PORT);
});



