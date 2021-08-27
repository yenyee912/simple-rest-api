const Action = require("../../models/seedInventory/Action");


exports.getAllAction = async (req, res) => {
    try {
        const x = await Action.find({}).sort({ id: 1 })
        if (x.length > 0)
            res.status(200).send({data: x});
         
        
        else 
            res.status(200).send({msg: "No data."})
    } 
    
    catch (err) {
        res.status(500).send({ msg: `Error while retrieving actions: ${err.message}.`});
    }
};

exports.getOneActionById = async (req, res) => {
    let actionId = req.params.actionId
    
    const x = await Action.findOne({ id: actionId})

    try {
        if (x) {
            res.status(200).send({ data: x})
        }
        
        else 
            res.status(200).send({ msg: "No data." })
    } 
    
    catch (err) {
        res.status(500).send({ msg: `Error while retrieving action with id= ${actionId}: ${err.message}.`});

    }
};

exports.createNewAction = async function (req, res) {
    let newAction = new Action({
        id: '',
        action: req.body.action,
    })

    let existAction = await Action.find()
    try{
        if (existAction.length>0){
            newAction.id=existAction.length
        }

        else{
            newAction.id=1 
        }

        const x = await newAction.save()
        try{

            if(x){
                res.status(201).send({
                    msg: `Successfully create action.`,
                    data: x
                });
            }

            else{
                res.status(304).send({ msg: `Unable to create action. Please try again.` })
            }
                
        }
        catch(err) {
            res.status(500).send({ msg: `Error while creating action: ${err.message}.`});
        }

    }

    catch(err){
        res.status(500).send({ msg: `Error while creating action: ${err.message}.` });
    }
};

exports.updateOneByActionId = async (req, res) => {    
    const actionId = req.params.actionId;

    // only allow to edit action
    let updatedAction= {
        id: actionId,
        action: req.body.action
    }
    const x = await Action.findOneAndUpdate({ id: actionId}, updatedAction, {
            upsert: false,
            useFindAndModify: false,
            returnOriginal: false
        })
    try {
        
        if (!x) {
            res.status(404).send({
                msg: `Failed to update action with id= ${x.id}. Please try again.`,
            })
        } 
        
        else {
            res.send({
                msg: `Action with id= ${x.id} updated successfully.`,
                data: x
            })
        }
    } 
    
    catch (err) {
        res.status(500).send({
            msg: `Error: ${err.message} when updating action with id= ${x.id}.`,
        })
    }
};

exports.deleteOneByActionId = async (req, res) => {
    let actionId = req.params.actionId;
    
    const x = await Action.findOneAndDelete({ id: actionId})

    try{
        if (x)
            res.status(200).send({ msg: `Successfully deleted action with id= ${actionId}.` })

        else
            res.status(200).send({ msg: `Unable to delete action with id= ${actionId}. Please try again.` })
    } 
    
    catch (err) {
        res.status(500).send({ msg: `Error while deleting action with id= ${actionId}: ${err.message}.` });
    }
};

exports.deleteAll = async (req, res) => {
    const x= await Action.deleteMany({})
    try{
        if (x.n > 0)
            res.status(200).send({ msg: `Successfully deleted ${x.n} action(s).` })

        else
            res.status(304).send({ msg: `Unable to delete action(s). Please try again.` })
    }
    
    catch(err){
        res.status(500).send({ msg: `Error while deleting action(s): ${err.message}.` });

      }
  };