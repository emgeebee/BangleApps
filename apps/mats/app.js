require("Font7x11Numeric7Seg").add(Graphics);
const storage = require('Storage');
const locale = require("locale");

const X = g.getWidth()/2, Y = 35;
const refs = {
    fixturesVilla: {
        file: "fixtures-villa.json",
        name: "Villa Fixtures"
    },
    fixturesToday: {
        file: "fixtures-today.json",
        name: "Today's fixtures"
    },
    table: {
        file: "table.json",
        name: "Table"
    },
    weatherweek: {
        file: "weather-chm-w.json",
        name: "Week's weather"
    },
    weatherday: {
        file: "weather-chm-d.json",
        name: "Today's weather"
    }
};

let menu = false;
let sunrise = '';
let sunset = '';
let temp = '';
let summary = '';

(() => {

    function updateFixtures(key) {
        let json = storage.readJSON(refs[key].file)||{};
        const menu = Object.keys(json).reduce((men, date) => {
            const competitions = json[date];
            Object.keys(competitions).forEach((comp) => {
                men[`${date} ${comp}`] = () => {};
                const games = competitions[comp];
                games.forEach((game) => {
                    const s = ` `;
                    if (game.home.goals || game.home.goals === 0) {
                        s += `${game.home.name} ${game.home.goals} v ${game.away.goals} ${game.away.name}`;
                    } else {
                        s += `${game.time} ${game.home.name} v ${game.away.name}`;
                    }
                    men[s] = () => {};
                });
            });
            return men;
        }, {
            "" : { "title" : `-- ${refs[key].name} --` },
        });
        E.showMenu(menu);

        // Show menu on BTN4
        setWatch(reset, BTN4, {repeat: false, edge: 'falling'});
    };

    function updateTable() {
        const key = 'table';
        let json = storage.readJSON(refs[key].file)||{};

        const menu = json.reduce((men, row) => {
            const s = row.join(' ');
            men[s] = () => {};
            return men;
        }, {
            "" : { "title" : `-- ${refs[key].name} --` },
        })
        E.showMenu(menu);

        // Show menu on BTN4
        setWatch(reset, BTN4, {repeat: false, edge: 'falling'});
    }

    function updateDailyWeather() {
        const key = 'weatherday';
        let json = storage.readJSON(refs[key].file)||{};

        const menu = json.reduce((men, row, i) => {
            men[`${row.time} t:${row.maxtemp} r:${row.willRain}`] = () => {};
            men[`${row.summary.slice(0, 16)}`] = () => {};
            men[`${row.summary.slice(16)}`] = () => {};
            men[`=================${i}`] = () => {};
            return men;
        }, {
            "" : { "title" : `-- ${refs[key].name} --` },
        })
        E.showMenu(menu);

        // Show menu on BTN4
        setWatch(reset, BTN4, {repeat: false, edge: 'falling'});
    };

    function updateWeeklyWeather(draw) {
        const key = 'weatherweek';
        const json = storage.readJSON(refs[key].file)||{};

        const menu = json.reduce((men, row, i) => {
            men[`${row.time} ${row.maxtemp}/${row.mintemp}`] = () => {};
            men[`sr:${row.sunrise} ss:${row.sunset}`] = () => {};
            men[`${row.summary.slice(0, 16)}`] = () => {};
            men[`${row.summary.slice(16)}`] = () => {};
            men[`=================${i}`] = () => {};
            return men;
        }, {
            "" : { "title" : `-- ${refs[key].name} --` },
        });
        E.showMenu(menu);

        // Show menu on BTN4
        setWatch(reset, BTN4, {repeat: false, edge: 'falling'});
    };

    function drawTime() {
        if (menu) {
            return;
        }
		const d = new Date();
		const h = d.getHours(), m = d.getMinutes();
		const time = ("0"+h).substr(-2) + ":" + ("0"+m).substr(-2) + ':' + ("0"+d.getSeconds()).substr(-2);
		g.reset();
		g.setFontAlign(0,-1);
		g.setFont("7x11Numeric7Seg",3);
		g.drawString(time, X, Y, true);
		// date
		g.setFont("6x8", 2);
		g.setFontAlign(0,1);
		const dateStr = `${locale.date(d)}`;
		g.drawString(dateStr, X, Y+60, true);
	}

    function loadWeeklyWeather() {
        const key = 'weatherweek';
        const json = storage.readJSON(refs[key].file)||{};

        const row = json[0];
        sunrise = row.sunrise;
        sunset = row.sunset;
        summary = row.summary;
        temp = `${row.maxtemp}/${row.mintemp}`;
		const sunStr = `${sunrise}/${sunset} t:${temp}`;
		g.drawString(sunStr, X, Y+80, true);
		const weatherStr = `${summary}`;
		g.drawString(weatherStr.slice(0, 20), X, Y+100, true);
        g.drawString(weatherStr.slice(21, 40), X, Y+120, true);

    };

	const menuItems = {};
	menuItems[refs["fixturesVilla"].name] = () => updateFixtures("fixturesVilla");
	menuItems[refs["fixturesToday"].name] = () => updateFixtures("fixturesToday");
	menuItems[refs["table"].name] = () => updateTable();
	menuItems[refs["weatherweek"].name] = () => updateWeeklyWeather(true);
	menuItems[refs["weatherday"].name] = () => updateDailyWeather();
	menuItems["Exit"] = () => {
        menu = false;
        E.showMenu();
    };

	function drawMenu() {
        menu = true;
		g.reset();
		var menu = E.showMenu(menuItems);
		menu.draw();
	}

	var secondInterval = setInterval(drawTime, 1000);
	// Stop updates when LCD is off, restart when on
	Bangle.on('lcdPower',on=>{
		if (secondInterval) clearInterval(secondInterval);
		secondInterval = undefined;
		if (on) {
			secondInterval = setInterval(drawTime, 1000);
			drawTime(); // draw immediately
		}
	});

	// Load widgets
	Bangle.loadWidgets();
	Bangle.drawWidgets();

	setWatch(drawMenu, BTN1, { repeat: false, edge: "falling" });
	setWatch(() => {
        if (!menu) {
            Bangle.showLauncher();
        }
    }, BTN2, { repeat: false, edge: "falling" });

    loadWeeklyWeather();
	drawTime();
})()
