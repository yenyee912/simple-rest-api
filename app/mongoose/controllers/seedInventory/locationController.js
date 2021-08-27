const Location = require("../../models/seedInventory/Location");

exports.getAllLocation = async (req, res) => {
    try {
        const x = await Location.find({}).sort({ id: 1 })
        if (x.length > 0) 
            res.status(200).send({ data: x });
        
        else 
            res.status(200).send({ msg: `No data.` });
    } 
    
    catch (err) {
        res.status(500).send({ msg: `Error while retrieving locations: ${err.message}.`, });

    }
};

exports.getOneByLocationId = async (req, res) => {
    let locId = req.params.locationId

    try {
        const x = await Location.findOne({id: locId})
        if (x)
            res.status(200).send({ data: x });
        
        else 
            res.status(200).send({ msg: `No data.` });
    } 
    
    catch (err) {
        res.status(500).send({ msg: `Error while retrieving location with id= ${locId}: ${err.message}.`, });
    }
};

exports.createNewLocation = async (req, res) =>{
    let newLocation = new Location({
        id: -1,
        location: req.body.location,
        alert: req.body.alert,
        isSubscribe: req.body.isSubscribe,
        subscriptionMail: req.body.subscriptionMail
    })

    let existLocation = await Location.find()
    try{
        if (existLocation.length>0){
            newLocation.id=existLocation.length
        }

        else{
            newLocation.id=1 
        }

        const x = await newLocation.save()
        try{
            if(x)
                res.status(201).send({
                    msg: `Successfully create location.`,
                    data: x
                });            
            else
                res.status(304).send({ msg: `Unable to create location. Please try again.` })
    
        }
        catch(err) {
            res.status(500).send({ msg: `Error while creating location: ${err.message}.`, });
        }

    }

    catch(err){
        console.log(err.message)
    }       
};


exports.updateOneByLocationId = async (req, res) => {    
    const locId = req.params.locationId;

    // only allow to edit location
        const x = await Location.findOneAndUpdate({id: locId}, req.body, {
            upsert: false,
            useFindAndModify: false,
            returnOriginal: false
        })
    try {
        
        if (x)
            res.status(201).send({
                msg: `Successfully update location with id= ${locId}.`,
                data: x
            });
        
        
        else
            res.status(200).send({ msg: `Unable to update location with id= ${locId}. Please try again.` })
        
    } 
    
    catch (err) {
        res.status(500).send({
            msg: `Error: ${err.message} when updating location with id= ${x.id}.`,
        })
    }
};

exports.deleteOneByLocationId = async (req, res) => {
    let locId = req.params.locationId;
    
    const x = await Location.findOneAndDelete({id: locId})
    try{
        if (x)
            res.status(200).send({ msg: `Successfully deleted location with id= ${locId}.` })

        else
            res.status(200).send({ msg: `Unable to delete location with id= ${locId}. Please try again.` })
    }
    
    catch (err) {
        res.status(500).send({ msg: `Error while deleting location with id= ${locId}: ${err.message}.` });
    }
};

exports.deleteAll = async (req, res) => {
    const x= await Location.deleteMany({})
    try{

        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} location(s).` })

        else
            res.status(304).send({ msg: `Unable to delete location(s). Please try again.` })

    }
    
    catch(err){
        res.status(500).send({ msg: `Error while deleting location(s): ${err.message}.` });
      }
  };