const scanRecord = require("../../models/seedInventory/Scan");

exports.getAllScanRecord = async (req, res) =>{
  let returningFields = ''
  if (req.query.fields) {
    let regex = /,/g
    returningFields = req.query.fields.replace(regex, ' ')
  }

  let queries = req.query
  delete queries.fields

  const x= await scanRecord.find(queries, returningFields).sort({$natural: -1})
  try{
    if (x.length > 0) 
      res.send({data: x})
   
    else 
      res.send({msg: `No data.`})
  }

  catch(err){
    res.status(500).send({ msg: `Error while retrieving scan record(s): ${err.message}.`, });
  } 
};

exports.getOneScanRecordByObjectId = async (req, res) =>{
  const rid= req.params.id;
  
  const x= await scanRecord.findOne({_id:rid})
  try{
      if(x)
        res.status(200).send(x);
      
      else
        res.status(200).send({msg: `No data.`})
  }
  
  catch(err){
    res.status(500).send({ msg: `Error while retrieving scan record with id= ${rid}: ${err.message}.`, });
    }
};


exports.deleteAll = async (req, res) => {
  const x= await scanRecord.deleteMany({})
  try{
    if (x.n > 0)
      res.status(200).send({ msg: `Successfully deleted ${x.n} scan record(s).` })

    else
      res.status(304).send({ msg: `Unable to delete scan record(s). Please try again.` })
  }
  
  catch(err){
    res.status(500).send({ msg: `Error while deleting scan record(s): ${err.message}.` });

    }
};

//delete one can change for whatever purpose
exports.deleteOneByObjectId = async (req, res) => {
  const rid = req.params.id;

  const x = await scanRecord.deleteOne({_id: rid})
  try{
    if(x.n>0)
      {res.send({message: `Record with id= ${rid} was deleted successfully.`})
      }
    else
      res.send({message: `Record with id= ${rid} not found.`})
    
    console.log(x)
  }
    catch(err){
      res.status(500).send({message: `Could not delete record with id= ${rid}`});
    }
};



