const { getTrips } = require('api');
const { getDriver } = require('api');
const { getVehicle } = require('api');

async function driverReport() {
  const allTrips = await getTrips()
  let totalDriversData = {};
  for (let i = 0; i < allTrips.length; i++) {
    try {
      const driver = await getDriver(allTrips[i].driverID);
      totalDriversData[allTrips[i].driverID] = driver;
      totalDriversData[allTrips[i].driverID]["vehicle"] = [];

      if (driver.vehicleID.length > 1) {
        for (let m = 0; m < driver.vehicleID.length; m++) {
          const vehicle = await getVehicle(driver.vehicleID[j]);
          totalDriversData[allTrips[i].driverID]["vehicle"].push(vehicle);
        }
      } else {
        const vehicle = await getVehicle(driver.vehicleID);
        totalDriversData[allTrips[i].driverID]["vehicle"].push(vehicle);
      }
    } catch (error) {
      continue;
    }
  }
  const totalOutput = []
  let objData = {
    fullname: '',
    phone: '',
    id: '',
    vehicles: [],
    noOfTrips: 0,
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    trips: [],
    totalAmountEarned: 0,
    totalCashAmount: 0,
    totalNonCashAmount: 0
  }
  let userVehicle = {
    plate: '',
    manufacturer: '',
  }
  let userTrip = {
    user: '',
    created: '',
    pickup: '',
    destination: '',
    billed: 0,
    isCash: false
  }

  const copyOfobjData = JSON.parse(JSON.stringify(objData));
  const copyOfVehicles = JSON.parse(JSON.stringify(userVehicle));
  const copyOfTrips = JSON.parse(JSON.stringify(userTrip));

  for (const key in allTrips) {
    for (let i = 0; i < allTrips.length; i++) {
      if (key === allTrips[i].driverID) {
        objData.totalAmountEarned +=
          +(allTrips[i].billedAmount) ||
          +(allTrips[i].billedAmount.split(",").join(""));
        objData.noOfTrips++;
        objData.id = key;
        objData.fullname = allTrips[key].name;
        objData.phone = allTrips[key].phone;
        if (allTrips[i].isCash === true) {
          objData.totalCashAmount +=
            +(allTrips[i].billedAmount) ||
            +(allTrips[i].billedAmount.split(",").join(""));
          objData.noOfCashTrips++;
        } else {
          objData.totalNonCashAmount +=
            +(allTrips[i].billedAmount) ||
            +(allTrips[i].billedAmount.split(",").join(""));
          objData.noOfNonCashTrips++;
        }
        userTrip.user = allTrips[i].user.name;
        userTrip.created = allTrips[i].created;
        userTrip.pickup = allTrips[i].pickup.address;
        userTrip.destination = allTrips[i].destination.address;
        userTrip.isCash = allTrips[i].isCash;
        userTrip.billed =
          +(allTrips[i].billedAmount) ||
          +(allTrips[i].billedAmount.split(",").join(""));

        for (let j = 0; j < allTrips[key].vehicle.length; j++) {
          userVehicle.plate = allTrips[key].vehicle[j].plate;
          userVehicle.manufacturer = allTrips[key].vehicle[j].manufacturer;
          if (objData.vehicles.length < allTrips[key].vehicle.length) {
            objData.vehicles.push(userVehicle);
            userVehicle = JSON.parse(JSON.stringify(copyOfTrips));
          }
        }
        objData.trips.push(objData);
        userTrip = JSON.parse(JSON.stringify(copyOfTrips));
      }
    }
    objData.totalAmountEarned = Number(
      Math.round(objData.totalAmountEarned * 100) / 100
    );
    objData.totalCashAmount = Number(objData.totalCashAmount * 100) / 100;
    objData.totalNonCashAmount = Number(
      Math.round(objData.totalNonCashAmount * 100) / 100
    );
    totalOutput.push(objData);
    objData = JSON.parse(JSON.stringify(copyOfobjData));
  }
  // console.log(modelOutput);
  return totalOutput
}
driverReport()
module.exports = driverReport;