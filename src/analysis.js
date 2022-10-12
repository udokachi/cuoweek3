const { getTrips, getDriver } = require("api");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */

 async function analysis() {
  try {
    const trips = await getTrips();
    const newTrips = [...trips];
    const totalAmount = newTrips.reduce((acc, cur) => {
      acc += +cur.billedAmount || +cur.billedAmount.split(",").join("");
      return acc;
    }, 0);

    let testObj = {
      noOfCashTrips: 0,
      noOfNonCashTrips: 0,
      cashBilledTotal: 0,
      nonCashBilledTotal: 0,
    };
    const totalCashTrips = newTrips.reduce((acc, cur) => {
      if (cur.isCash === true) {
        testObj.noOfCashTrips += 1;
        testObj.cashBilledTotal +=
          +cur.billedAmount || +cur.billedAmount.split(",").join("");
      } else {
        testObj.noOfNonCashTrips += 1;
        testObj.nonCashBilledTotal +=
          +cur.billedAmount || +cur.billedAmount.split(",").join("");
      }
      return testObj;
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
    let driversWithMoreTrips = [];
    for (let i = 0; i < driverIds.length; i++) {
      mostTrips[driverIds[i]] = (mostTrips[driverIds[i]] || 0) + 1;
    }
    let values = Object.values(mostTrips);
    let max = Math.max(...values);
    for (key in mostTrips) {
      if (mostTrips[key] == max) {
        driversWithMoreTrips.push(key);
      }
    }
    let mostTripsByDriver = {};
    let res = await getDriver(driversWithMoreTrips[0]);
    mostTripsByDriver.name = res.name;
    mostTripsByDriver.email = res.email;
    mostTripsByDriver.phone = res.phone;
    mostTripsByDriver.noOfTrips = 0;
    mostTripsByDriver.totalAmountEarned = 0;
    for (let i = 0; i < newTrips.length; i++) {
      if (newTrips[i].driverID == driversWithMoreTrips[0]) {
        mostTripsByDriver.totalAmountEarned +=
          +newTrips[i].billedAmount ||
          +newTrips[i].billedAmount.split(",").join("");
        mostTripsByDriver.noOfTrips += 1;
      }
    }

    let obj2 = {};
    obj2[driversWithMoreTrips[0]] = 0;
    obj2[driversWithMoreTrips[1]] = 0;

    const objKeys = Object.keys(obj2);
    newTrips.forEach((trip) => {
      if (trip.driverID === objKeys[0]) {
        obj2[driversWithMoreTrips[0]] +=
          +trip.billedAmount || +trip.billedAmount.split(",").join("");
      } else if (trip.driverID === objKeys[1]) {
        obj2[driversWithMoreTrips[1]] +=
          +trip.billedAmount || +trip.billedAmount.split(",").join("");
      }
    });
    let maximum = 0;
    for (key in obj2) {
      if (obj2[`${key}`] > 0) {
        maximum = key;
      }
    }
    const highestEarning = await getDriver(maximum);
    const result = {
      noOfCashTrips: testObj.noOfCashTrips,
      noOfNonCashTrips: testObj.noOfNonCashTrips,
      billedTotal: Number(totalAmount.toFixed(2)),
      cashBilledTotal: testObj.cashBilledTotal,
      nonCashBilledTotal: Number(testObj.nonCashBilledTotal.toFixed(2)),
      noOfDriversWithMoreThanOneVehicle: driversWithMoreCars,
      mostTripsByDriver: mostTripsByDriver,
      highestEarningDriver: {
        name: highestEarning.name,
        email: highestEarning.email,
        phone: highestEarning.phone,
        noOfTrips: mostTripsByDriver.noOfTrips,
        totalAmountEarned: obj2[maximum],
      },
    };
    return result
  } catch (e) {
    console.log(e);
  }
}
// console.log(analysis());
module.exports = analysis;