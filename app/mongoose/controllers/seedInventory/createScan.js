const scanRecord = require("../../models/seedInventory/Scan");

//association
const seedInventory = require("../../models/seedInventory/SeedInventory");

var moment = require("moment");

exports.createScan = (req, res) => {

  //scanList newRecord 
  let scanRecordMsg=''
  let scanRecordEntry=[]

  //uniqueEntry
  let uniqueMsg=[] // newRecord the write/update ops details 
  let uniqueRecordEntry=[] //newRecord success entries ONLY
  let prepareDataMsg=[] // newRecord the data preparation details --> if exist== item failed

  let newRecord = new scanRecord({    
    staffEmail: req.body.staffEmail,
    staffName: req.body.staffName,
    timestamp: moment().format('DD-MM-YYYY HH:mm:SS'),  
    action: req.body.action,
    
    scanLocation: req.body.scanLocation,
    scanDestination: req.body.scanDestination, //for scan-out/discard only
    scanList: req.body.scanList,
  })

  async function executeAll(){
    // for every different seed packet (not unique packet) in scanList
    for (let i=0; i<newRecord.scanList.length; i++){

      let singleSeedPacket = {
        scanStatus: '',
        seedId: newRecord.scanList[i].seedId,
        cultivarId: newRecord.scanList[i].cultivarId,      
        expYear: newRecord.scanList[i].expYear,
        quantity: newRecord.scanList[i].quantity, 

        scanLocation: newRecord.scanLocation,
        scanDestination: newRecord.scanDestination,
        action: newRecord.action,
        
        remarks: newRecord.scanList[i].remarks,
      }

        let preparedData= await prepareUniqueSeedEntry(singleSeedPacket) // result an arr which can be write/update to seedInv
        
        if (preparedData.length>0){        
          await createUniqueSeedEntry(preparedData) // insert the data resulted from prepareUniqueSeedEntry()
    }        
        else{
        // data does not write into DB
        // this happened when the seed scan-out/ farm-out not exist
          uniqueMsg.push(`Quantity of seeds with id= ${singleSeedPacket.seedId} exceed. Please check the inventory list.`)
      }
    } // ./end per item operatios

    // if the successful entries != the items scanned
    if (uniqueRecordEntry.length!=newRecord.scanList.length){

      // if at least one item success
      if (uniqueRecordEntry.length>=1)
      newRecord.scanStatus='PENDING'
      
      // if all items scanned failed 
      else
      newRecord.scanStatus='FAILED'
    }

    else {
        newRecord.scanStatus='SUCCESS'
    }

    newRecord.feedbackMessage={
      uniqueFeedbackMsg: uniqueMsg,
      successRecord: uniqueRecordEntry
    }

    await createScanRecord()
    res.status(200).send({scanRecordMsg: scanRecordMsg, scanRecordEntry:scanRecordEntry, 
        uniqueMsg: uniqueMsg, uniqueRecordEntry: uniqueRecordEntry})
  }

  executeAll()


// -----functions -------
// 1. create scan newRecord
  async function createScanRecord(){
    const x = await newRecord.save()
  try{
    scanRecordMsg= `Scan newRecord with id= ${x._id} was ${x.scanStatus}.`
    scanRecordEntry= x
  }
  catch(err){
    scanRecordMsg= `Error: ${err.message}. Unable to create scan newRecord. Please try again.`
  }
  }

  async function assignStatus(action){
    // action: 0-none, 1-scan in, 2-scan out, 3-farm in, 4-discard, 5-transfer
    
    //status: 0 - inactive, 1 - expired, 2 - discard, 3 - in-transit,
    //4- active, 5 -in-farm, 6 - in-use, 7-other
    
    let status=0 //if none of the action matched
    
    if (action==1){ //scan in--> active
      status=4
    }
  
    else if (action== 2){ //scan out--> in transit
      status=3
    }
  
    else if (action==3 || action==5){ //farm in(action 3)--> in farm
      status=5 
      //transfer(action 5) --> in farm (directly, no in-transit, location==> destination farm)
      //for transfer, ask user provide desitination farm
    }
  
    else if (action==4){ //discard--> discard
      status=2 
    }
  
    return status
  } 

  async function assignCondition(seedId, action, scanDestination, scanLocation){
    // action: 0-none, 1-scan in, 2-scan out, 3-farm in, 4-discard, 5-transfer
    
    //status: 0 - inactive, 1 - expired, 2 - discard, 3 - in-transit,
    //4- active, 5 -in-farm, 6 - in-use, 7-other
    
    let condition= {
        seedId: seedId
    }
    
    if (action== 2){ // if hq wanna scan out, find active and in hq (scan location)
        condition.status=4
        condition.currentLocation= scanLocation
    }
  
    else if (action==3){ // if farm wanna scan in, find in-transit and dest=farm
        condition.status=3 
        condition.currentDestination= scanLocation
    }
  
    else if (action==4){ // if farm wanna discard, find in-farm/in-use
        condition.status= { $gte:5 }
        condition.currentLocation= scanLocation
    }
  
    return condition
  } 

  async function prepareUniqueSeedEntry(item){
    let assignedStatus = await assignStatus(item.action) 
    let filterCond= await assignCondition(item.seedId, item.action, item.scanDestination, item.scanLocation) 
    
    let uniqueData = [] // for data prepared

    // hq scan in, no need to wait for condition
    if (item.action==1){  
          
        for (let j=0; j<item.quantity; j++){

        let singleUniqueEntry= {
          seedId: item.seedId,
          cultivarId: item.cultivarId,      
          expYear: item.expYear,
          remarks: item.remarks,
          currentLocation: item.scanLocation,
          currentDestination: item.scanDestination,                        
          status: assignedStatus,
          history: [
            {
              staffEmail: newRecord.staffEmail,
              staffName: newRecord.staffName,
              timestamp: newRecord.timestamp,  
              action: item.action,
              scanLocation: item.scanLocation, }
          ]
        }        
        
        uniqueData.push(singleUniqueEntry)

        } // ./ end quantity loop

      } // ./ end action1


      else{
        let invRec = await seedInventory.find(filterCond).sort({expYear:1}).limit(item.quantity).exec()

        try{
            // data exist
            if (invRec.length == item.quantity){
              for (let j=0; j<invRec.length; j++){   
                let singleUniqueEntry= {
                  _id: invRec[j]._id,
                  seedId: item.seedId,
                  remarks: item.remarks,
                  currentLocation: item.scanLocation, 
                  currentDestination: item.scanDestination,               
                  status: assignedStatus,
  
                  //get the previous history first
                  history: invRec[j].history
                }
  
                let newHistory={
                  staffEmail: newRecord.staffEmail,
                  staffName: newRecord.staffName,
                  timestamp: newRecord.timestamp,  
                  action: item.action,
                  scanLocation: item.scanLocation,
                  scanDestination: item.scanDestination
                }            
                singleUniqueEntry.history.push(newHistory)
  
                uniqueData.push(singleUniqueEntry)
  
            } // ./quantity loop
          } // ./end check data exist
  
          else{
            prepareDataMsg.push(`Data not exist. Please check the inventory list.`)
          }
          } 
          
          catch(err){
              // error for find newRecord
              console.log(err.message)
          }

      }

    return uniqueData
  }

  async function createUniqueSeedEntry(array){
    let operationMsg=''
    switch (newRecord.action) {
      case 1:
        operationMsg = "inserted";
        break;
      case 2:
        operationMsg = "dispatched out";
        break;
      case 3:
        operationMsg = "inserted to farm";
        break;
      case 4:
        operationMsg = "discarded";
        break;
    }

    if (newRecord.action==1){
      const insertUnique= await seedInventory.insertMany(array, {ordered: true})
      try{
        if (insertUnique[0].seedId!=''){
          uniqueMsg.push(`${insertUnique.length} seed(s) with id= ${insertUnique[0].seedId} has been ${operationMsg}.`)
          uniqueRecordEntry.push(insertUnique[0])
        }

        else{
          uniqueMsg.push(`Unable to insert seeds with id= ${insertUnique[0].seedId}. Please try again.`)
        }
          
        } 
      catch(err){
        uniqueMsg.push(`Error: ${err.message}. Unable to insert seeds with id= ${insertUnique[0].seedId}.`)
      }
    }
  
    else if (newRecord.action>=2 && newRecord.action<=4){
        //update
        // a trick to limit the number of records(s) updated
        let ids=[]
        array.forEach(element => {
          ids.push(element._id)
        });

        delete array[0]._id // the new documenet/body
        const updateUnique= await seedInventory.updateMany({_id: {$in: ids}},  array[0], { 
            upsert: false,
            useFindAndModify: false,
            returnOriginal: false,
            ordered: true,
          })

        try{
          if (updateUnique.n>0){
            // console.log(`Update ${updateUnique.n} seeds with id= ${array[0].seedId}.`)
            uniqueMsg.push(`${updateUnique.n} seeds with id= ${array[0].seedId} has been ${operationMsg}.`)
            uniqueRecordEntry.push(array[0])
          }

          else{
            uniqueMsg.push(`Quantity of seeds with id= ${updateUnique[0].seedId} exceed. Please check the inventory list.`)
          }
         
          }
        
        catch(err){
          uniqueMsg.push(`Error: ${err.message}. Unable to update seeds with id= ${updateUnique[0].seedId}. Please try again.`)
          } 

  }

  }
}