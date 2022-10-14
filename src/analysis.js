const { getTrips, getDriver } = require("api");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */

 async function analysis() {
  try {
    const newTrips = await getTrips();
    // const newTrips = [...trips];
    //calculate totalamount by adding all amounts together
    const totalAmount = newTrips.reduce((acc, cur) => {
      acc += +cur.billedAmount || +cur.billedAmount.split(",").join("");
      return acc;
    }, 0);
    // console.log(totalAmount)

    let testObj = {
      noOfCashTrips: 0,
      noOfNonCashTrips: 0,
      cashBilledTotal: 0,
      nonCashBilledTotal: 0,
    };
    newTrips.reduce((acc, cur) => {
      if (cur.isCash === true) {
        testObj.noOfCashTrips += 1;
        testObj.cashBilledTotal +=
          +cur.billedAmount || +cur.billedAmount.split(",").join("");
      } else {
        testObj.noOfNonCashTrips += 1;
        testObj.nonCashBilledTotal +=
          +cur.billedAmount || +cur.billedAmount.split(",").join("");
      }
    }, testObj);

    const driverIds = newTrips.map((el) => el.driverID);
    const uniqueDrivers = [...new Set(driverIds)];
    const details = uniqueDrivers.map((el) => getDriver(el));
    const final = await Promise.allSettled(details);
    let driversWithMoreCars = 0;
    for (let i = 0; i < final.length; i++) {
      if (final[i].status === "rejected") {
        continue;
      } else if (final[i].value.vehicleID.length > 1) {
        driversWithMoreCars++;
      }
    }
    const mostTrips = {};
    let driversWithMoreTrips = '';
    //if the driver id property exsit in the object it should increment by 1 else set it to 1
    for (let i = 0; i < driverIds.length; i++) {
      mostTrips[driverIds[i]] = (mostTrips[driverIds[i]]+1 || 1);
    }
    let values = Object.values(mostTrips);
    //get max of the values in the mosttrips object
    let max = Math.max(...values);
    for (key in mostTrips) {
      //get the key with that max value and break the loop
      if (mostTrips[key] == max) {
        driversWithMoreTrips=key;
        break;
      }
    }
    let mostTripsByDriver = {};
    let DriverWithMostTripDetails = await getDriver(driversWithMoreTrips);
    mostTripsByDriver.name = DriverWithMostTripDetails.name;
    mostTripsByDriver.email = DriverWithMostTripDetails.email;
    mostTripsByDriver.phone = DriverWithMostTripDetails.phone;
    mostTripsByDriver.noOfTrips = 0;
    mostTripsByDriver.totalAmountEarned = 0;
    for (let i = 0; i < newTrips.length; i++) {
      if (newTrips[i].driverID == driversWithMoreTrips) {
        mostTripsByDriver.totalAmountEarned +=
          +newTrips[i].billedAmount || +newTrips[i].billedAmount.split(",").join("");
        mostTripsByDriver.noOfTrips += 1;
      }
    }

    const driverByAmount = {};
    let highestEarnerId= '';
    for (let i = 0; i < newTrips.length; i++) {
      let eachAmount= +newTrips[i].billedAmount || +newTrips[i].billedAmount.split(",").join("");
      driverByAmount[driverIds[i]] = (driverByAmount[driverIds[i]]+eachAmount) || eachAmount;
    }

    let amounts = Object.values(driverByAmount);
    //get max of the values in the driverbyamount object
    let maxAmt = Math.max(...amounts);
    for (key in driverByAmount) {
      //get the key with that max value and break the loop
      if (driverByAmount[key] == maxAmt) {
        highestEarnerId=key;
        break;
      }
    }
    // console.log(highestEarnerId)
    let mostAmountByDriver = {};
    let DriverWithMostAmountDetails = await getDriver(highestEarnerId);
    mostAmountByDriver.name = DriverWithMostAmountDetails.name;
    mostAmountByDriver.email = DriverWithMostAmountDetails.email;
    mostAmountByDriver.phone = DriverWithMostAmountDetails.phone;
    mostAmountByDriver.noOfTrips = 0;
    mostAmountByDriver.totalAmountEarned = 0;
    for (let i = 0; i < newTrips.length; i++) {
      if (newTrips[i].driverID == highestEarnerId) {
        mostAmountByDriver.totalAmountEarned +=
          +newTrips[i].billedAmount || +newTrips[i].billedAmount.split(",").join("");
          mostAmountByDriver.noOfTrips += 1;
      }
    }

    const result = {
      noOfCashTrips: testObj.noOfCashTrips,
      noOfNonCashTrips: testObj.noOfNonCashTrips,
      billedTotal: Number(totalAmount.toFixed(2)),
      cashBilledTotal: testObj.cashBilledTotal,
      nonCashBilledTotal: Number(testObj.nonCashBilledTotal.toFixed(2)),
      noOfDriversWithMoreThanOneVehicle: driversWithMoreCars,
      mostTripsByDriver: mostTripsByDriver,
      highestEarningDriver: mostAmountByDriver,
    };
    return result;
  } catch (error) {
    console.log(error);
  }
}
// console.log(analysis());
module.exports = analysis;