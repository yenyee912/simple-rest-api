const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //image goes /temp first before going to /images
        cb(null, './temp/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}`);
    },

});

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    //reject non image
    else {
        cb("Please upload only images.", false);
    }
};

const uploadImage = multer(
    {
        storage: storage,
        fileFilter: imageFilter
    });

module.exports = uploadImage;