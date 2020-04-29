const form = document.querySelector("form");
const displayStops = document.querySelector("#displaystops");
let promiseArray = [];
const url = `https://api.winnipegtransit.com/v3/`;
const apikey = `api-key=8djldBk38C5Kbz0sRtP`;

form.addEventListener("submit", function() {
  displayStops.innerHTML = "";
  event.preventDefault();
  const streetKey = findStreetId();
});

//Getting street id
const findStreetId = function() {
  const street = document.getElementById("name").value;
  const type = document.getElementById("type").value;
  fetch(`${url}streets.json?${apikey}&name=${street}&type=${type}`)
    .then(response => response.json())
    .then(streetResult => {
      const stKey = streetResult.streets[0].key;
      findStreetStops(stKey);
    });
};

// Getting street stops
const findStreetStops = function(streetKey) {
  fetch(`${url}stops.json?${apikey}&street=${streetKey}`)
    .then(response => response.json())
    .then(stopsOnStreet => {
      for (let x = 0; x < stopsOnStreet.stops.length; x++) {
        const stopKey = stopsOnStreet.stops[x].key;
        findStopSchedules(stopKey);
      }
    });
};

//Getting Route schedules for each stop in next 2 hours
const findStopSchedules = function(stopKey) {
  let promise = fetch(
    `${url}stops/${stopKey}/schedule.json?${apikey}&max-results-per-route=2`
  ).then(allStopKeysSchedules => {
    console.log(allStopKeysSchedules);
    return allStopKeysSchedules.json();
  });
  promiseArray.push(promise);
  Promise.all(promiseArray).then(scheduleAtBusStop =>
    display(scheduleAtBusStop)
  );
};
//Displaying all data
const display = function(schedule) {
  let stop = schedule[schedule.length - 1]["stop-schedule"].stop;
  displaystops.insertAdjacentHTML(
    "beforeend",
    `<li><b>${stop.name} </b>,    Stop No :  ${stop.key}
                                    <ul>Direction :${stop.direction}   ,    Side Street :${stop["cross-street"].name}</ul></li>`
  );
  let stop1 = schedule[schedule.length - 1]["stop-schedule"]["route-schedules"];
  if (stop1.length === 0) {
    displaystops.insertAdjacentHTML(
      "beforeend",
      `<ul><b>Route # :</b> No bus Coming Right now</ul>`
    );
  } else {
    for (let i = 0; i < stop1.length; i++) {
      displaystops.insertAdjacentHTML(
        "beforeend",
        `<ul><b>Route # :</b> ${stop1[i].route.number}</ul>
                                         <ul>First Bus Arrival Time : ${stop1[i]["scheduled-stops"][0].times.arrival.scheduled}</ul>
                                         <ul>2nd Bus Arrival Time : ${stop1[i]["scheduled-stops"][1].times.arrival.scheduled}</ul>`
      );
    }
  }
};
