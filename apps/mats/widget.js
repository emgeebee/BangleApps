const storage = require('Storage');
const fileRefs = {
    "watch-fixtures-villa": "fixtures-villa.json",
    "watch-fixtures-today": "fixtures-today.json",
    "watch-table": "table.json",
    "watch-weather-chelmsford-week": "weather-chm-w.json",
    "watch-weather-chelmsford-day": "weather-chm-d.json",
};

function updateData(json, key) {
    storage.write(fileRefs[key], JSON.stringify(json));
    console.log('written ' + fileRefs[key] + ' ' + JSON.stringify(json));
};

const _GB = global.GB;
global.GB = (event) => {
  if (event.t==="notify" && event.src.toLowerCase() === "pushbullet") {
      updateData(JSON.parse(event.body), event.title);
  }
  if (_GB) setTimeout(_GB, 0, event);
};
