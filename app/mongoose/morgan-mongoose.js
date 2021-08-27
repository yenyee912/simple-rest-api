const mongoose = require('mongoose');
const morgan = require('morgan');
const stream = require('stream');
const carrier = require('carrier');
const passStream = new stream.PassThrough();

let logSchema;

/**
 * MongooseMorgan object
 * @param  {object} mongoData - represents mongo database data, requires { connectionString : '{MONGO_URL}' } parameter.
 * @param  {object} options - represents morgan options, check their github, default value is empty object {}.
 * @param  {string} format - represents morgan formatting, check their github, default value is 'combined'.
 */
function MongooseMorgan(mongoData, options, format) {
    // Filter the arguments
    var args = Array.prototype.slice.call(arguments);

    if (args.length === 0 || !mongoData.connectionString) {
        throw new Error('Mongo connection string is null or empty. Try by adding this: { connectionString : \'{mongo_url}\'}');
    }

    if (args.length > 1 && typeof options !== 'object') {
        throw new Error('Options parameter needs to be an object. You can specify empty object like {}.');
    }

    if (args.length > 2 && typeof format === 'object') {
        throw new Error('Format parameter should be a string. Default parameter is \'combined\'.');
    }

    options = options || {};
    format = format || 'combined';

    // Create connection to MongoDb
    var collection = mongoData.collection || 'logs';
    var capped = mongoData.capped;
    var cappedSize = (mongoData.cappedSize || 10000000);
    var cappedMax = mongoData.cappedMax;

    mongoose.connect(mongoData.connectionString, {
        user: mongoData.user || null,
        pass: mongoData.pass || null,
        dbName: mongoData.dbName || null,
        useNewUrlParser: mongoData.useNewUrlParser || true,
        useUnifiedTopology: mongoData.useUnifiedTopology || true
    });

    // Create stream to read from
    var lineStream = carrier.carry(passStream);
    lineStream.on('line', onLine);

    // Morgan options stream
    options.stream = passStream;

    // Schema - only once created.
    if (!logSchema) {
        logSchema = mongoose.Schema({
            date: String,
            time: String,
            log: String,
            request: String,
            status: String,
            agent: String
        }, capped ? {
            capped: {
                size: cappedSize,
                max: cappedMax
            }
        } : {});
    }

    // Create mongoose model
    var Log = mongoose.model('Log', logSchema, collection);

    function onLine(line) {
        // console.log(line);
        let formattedLine = line.split('"')

        // console.log(formattedLine)
        let ts = Date.now();
        date_ob = new Date(ts);
        let day = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();

        var logModel = new Log({
            date: `${day}-${month}-${year}`,
            time: `${hours}:${minutes}:${seconds}`,
            log: line,
            request: formattedLine[1],
            status: formattedLine[2].toString().trim(),
            agent: formattedLine[5].toString().trim(),
        });

        logModel.save(function (err) {
            if (err) {
                throw err;
            }
        });
    }

    var mongooseMorgan = morgan(format, options);
    return mongooseMorgan;
}

module.exports = MongooseMorgan;
module.exports.compile = morgan.compile;
module.exports.format = morgan.format;
module.exports.token = morgan.token;
