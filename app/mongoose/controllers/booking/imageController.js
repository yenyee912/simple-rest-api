const Image = require("../../models/booking/Image");
var Booking = require("../../models/booking/Booking");
const path = require('path');
const fs = require('fs');

async function pushBookingImages(metadata, DOnumber, index) {

    let tempPath = metadata.path
    let extension = path.extname(metadata.originalname)
    let targetPath = path.resolve('./images/booking/' + index+'-'+DOnumber + extension)
    let newPath = fs.rename(tempPath, targetPath, function (err) {
        console.log(newPath)
    })
    let filename = `${index}-${DOnumber}${extension}`;

    let filepath = `/booking/${index}-${DOnumber}${extension}`;

    return { fileName: filename, filePath: filepath}

}

// POST will not check image exist or not--> left this to FE
// POST may saved more than 2 records with same DO --> but old images will be covered by new images
//  GET query will only query the latest DO record
// to avoid duplicate DO, perform check in FE
exports.uploadBookingImages = async (req, res) => {
    let DOnumber = req.DOnumber

    const bookingRecord = await Booking.findOne({ DO: DOnumber })

    try {
        if (bookingRecord && req.files) {
            let imageRecord = new Image({
                DO: DOnumber,
                remarks: req.body.remarks,
                fileName: [],
                filePath: []
            })

            // console.log(req.files)

            for (let i=0; i<req.files.length; i++){
                let index= parseInt(i+1)
                let imageData = await pushBookingImages(req.files[i], imageRecord.DO, index )
                imageRecord.filePath.push(imageData.filePath)
                imageRecord.fileName.push(imageData.fileName)
            }

            const x = await imageRecord.save()

            try {
                if (x)
                    res.status(201).send({
                        msg: `Successfully upload booking image.`,
                        data: x
                    });

                else
                    res.status(304).send({ msg: `Unable to upload booking image. Please try again.` })
            }

            catch (err) {
                res.status(500).send({ msg: `Error while uploading booking image: ${err.message}.` });
            }
        }

        else {
            res.status(200).send({ msg: `No data.` })
        }
    }

    catch (err) {
        res.status(500).send({ msg: `Error while uploading booking image(s): ${err.message}.` });
    }
};


exports.getImageByDO = async (req, res, next) => {
    let DOnumber = req.DOnumber

    const x = await Image.findOne({ DO: DOnumber }).sort({_id: -1})

    try{
        if (x)
            res.status(200).send({ data: x });
        else
            res.status(200).send({ msg: `No data.` });

    }

    catch(err){
        res.status(500).send({ msg: `Error while retrieving booking image(s): ${err.message}.`, });

    }
};


exports.deleteImageByDO = async (req, res, next) => {
    let DOnumber = req.DOnumber

    const x = await Image.deleteMany({ DO: DOnumber })

    try {
        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} booking image(s) record.` })

        else
            res.status(304).send({ msg: `Unable to delete booking image(s) record. Please try again.` })

    }

    catch (err) {
        res.status(500).send({ msg: `Error while deleting booking image(s) with DO= ${DOnumber}: ${err.message}.`, });
    }
};

exports.getOneImageByDO = async (req, res, next) => {
    let fileName= req.params.fileName

    const x = await Image.findOne({ DO: req.DOnumber, fileName: fileName }).sort({ _id: -1 })

    try {
        if (x){

            let imageObject = { 
                fileName: x.fileName[x.fileName.indexOf(fileName)],
                filePath: x.filePath[x.fileName.indexOf(fileName)]
            }

            res.status(200).send({ data: imageObject });
        }
        else
            res.status(200).send({ msg: `No data.` });

    }

    catch (err) {
        res.status(500).send({ msg: `Error while retrieving booking image(s) with filename= ${fileName}: ${err.message}.`, });

    }
};


exports.deleteImageByDO = async (req, res, next) => {
    let DOnumber = req.DOnumber

    const x = await Image.deleteMany({ DO: DOnumber })

    try {
        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} booking image(s) record.` })

        else
            res.status(304).send({ msg: `Unable to delete booking image(s) record. Please try again.` })

    }

    catch (err) {
        res.status(500).send({ msg: `Error while deleting booking image(s) with DO= ${DOnumber}: ${err.message}.`, });
    }
};


