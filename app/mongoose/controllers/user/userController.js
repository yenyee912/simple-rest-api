const User = require("../../models/user/User");

const _ = require('lodash')

exports.getAllUser = async (req, res) => {
  try {
    const x = await User.find({}).sort({ name: 1 })

    if (x.length > 0)
      res.status(200).send({ data: x });

    else
      res.status(200).send({ msg: `No data.` });
  }

  catch (err) {
    res.status(500).send({ msg: `Error while retrieving users: ${err.message}.` });
  }
};



