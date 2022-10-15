const { getTrips, getDriver, getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */

async function driverReport() {
  try{
    const allTrips = await getTrips()
    const resultObj={};

    const driverIds = allTrips.map((trip) => trip.driverID);
    const uniqueDrivers = [...new Set(driverIds)];
    const details = uniqueDrivers.map((driverId) => getDriver(driverId));
    const final = await Promise.allSettled(details);
    // console.log(final);
    
    for(let i=0; i<uniqueDrivers.length; i++){
      if (final[i].status=='fulfilled'){
        // add required driver details into result object
        resultObj[uniqueDrivers[i]]={
          fullName: final[i].value.name,
          phone: final[i].value.phone,
          id: uniqueDrivers[i],
          vehicles: final[i].value.vehicleID.map(vehicleId=> getVehicle(vehicleId)),
         
          trips: [],
          noOfTrips: 0,
          noOfCashTrips: 0,
          noOfNonCashTrips:0,
          totalAmountEarned: 0,
          totalCashAmount: 0,
          totalNonCashAmount: 0
        }
      }
      else{
        resultObj[uniqueDrivers[i]]= {
          id: uniqueDrivers[i],
          trips: [],
          noOfTrips: 0,
          noOfCashTrips: 0,
          noOfNonCashTrips:0,
          totalAmountEarned: 0,
          totalCashAmount: 0,
          totalNonCashAmount: 0
        }
      }
    }
    for(let i=0; i<allTrips.length; i++){
      let amount= +allTrips[i].billedAmount || +allTrips[i].billedAmount.split(",").join("");
      let driverId= allTrips[i].driverID;
      resultObj[driverId].totalAmountEarned+=amount;
      resultObj[driverId].noOfTrips+=1;
      let tripsData= {
        "user": allTrips[i].user.name,
        "created": allTrips[i].created,
        "pickup": allTrips[i].pickup.address,
        "destination": allTrips[i].destination.address,
        "billed": amount,
        "isCash": allTrips[i].isCash
      }
      resultObj[driverId].trips.push(tripsData)
   
      if (allTrips[i].isCash== true){
        resultObj[driverId].noOfCashTrips+= 1;
        resultObj[driverId].totalCashAmount+= amount;
      }
      else{
        resultObj[driverId].noOfNonCashTrips+= 1;
        resultObj[driverId].totalNonCashAmount+= amount;
      }
    }

    for (key of Object.keys(resultObj)){
      let driverVehicles= resultObj[key].vehicles ? await Promise.allSettled(resultObj[key].vehicles): [];
      driverVehicles.forEach((vehicle, index)=>{
        if(vehicle.status== 'fulfilled'){
        resultObj[key].vehicles[index]= {
          manufacturer: vehicle.value.manufacturer,
          plate: vehicle.value.plate
      }}})
    }
    let result=[];
    for (value of Object.values(resultObj)){
      result.push(value)
    }
    return result
  }
  catch(error){
    console.log(error)
  }
}
module.exports = driverReport;