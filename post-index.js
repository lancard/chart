const fs = require('fs');
const path = require('path');
const PDFMerger = require('pdf-merger-js');

if (process.argv.length <= 2) {
    console.log("usage: node post-index.js 2023-04-22");
    process.exit(0);
}

const effectiveAiracDate = process.argv[2].substring(0, 10);

(async () => {
    // merge RKSI area chart
    var rksiMerger = new PDFMerger();
    await rksiMerger.add(`AIP/${effectiveAiracDate}/AD/RKSI/AREA CHART - ICAO (DEP).pdf`);
    await rksiMerger.add(`AIP/${effectiveAiracDate}/AD/RKSI/AREA CHART - ICAO (ARR).pdf`);

    await rksiMerger.save(`AIP/${effectiveAiracDate}/AD/RKSI/AREA CHART.pdf`);

    fs.unlinkSync(`AIP/${effectiveAiracDate}/AD/RKSI/AREA CHART - ICAO (DEP).pdf`)
    fs.unlinkSync(`AIP/${effectiveAiracDate}/AD/RKSI/AREA CHART - ICAO (ARR).pdf`)

    // merge RKSS area chart
    var rkssMerger = new PDFMerger();
    await rkssMerger.add(`AIP/${effectiveAiracDate}/AD/RKSS/AREA CHART - ICAO (DEP).pdf`);
    await rkssMerger.add(`AIP/${effectiveAiracDate}/AD/RKSS/AREA CHART - ICAO (ARR).pdf`);

    await rkssMerger.save(`AIP/${effectiveAiracDate}/AD/RKSS/AREA CHART.pdf`);

    fs.unlinkSync(`AIP/${effectiveAiracDate}/AD/RKSS/AREA CHART - ICAO (DEP).pdf`)
    fs.unlinkSync(`AIP/${effectiveAiracDate}/AD/RKSS/AREA CHART - ICAO (ARR).pdf`)

    // copy RKSI MSA from RKSI to RKSS
    fs.copyFileSync(
        `AIP/${effectiveAiracDate}/AD/RKSI/ATC SURVEILLANCE MINIMUM ALTITUDE CHART.pdf`,
        `AIP/${effectiveAiracDate}/AD/RKSS/ATC SURVEILLANCE MINIMUM ALTITUDE CHART.pdf`
    );

    // copy RKPD OBST CHART from A to B
    fs.copyFileSync(
        `AIP/${effectiveAiracDate}/AD/RKPD/AD OBSTACLE CHART TYPE A.pdf`,
        `AIP/${effectiveAiracDate}/AD/RKPD/AD OBSTACLE CHART TYPE B.pdf`
    );

    // generate json
    const chartTypes =
        [
            "AD CHART",
            "AD GROUND MOVEMENT CHART",
            "AD OBSTACLE CHART TYPE A",
            "AD OBSTACLE CHART TYPE B",
            "AIRCRAFT PARKING DOCKING CHART",
            "AREA CHART",
            "ATC SURVEILLANCE MINIMUM ALTITUDE CHART",
            "BIRD CONCENTRATION CHART",
            "INSTR APCH CHART",
            "PRECISION APP TERRAIN CHART",
            "SID",
            "STAR",
            "TEXT",
            "VISUAL APCH CHART"
        ];

    var airportList = fs.readdirSync(`AIP/${effectiveAiracDate}/AD`).filter(e => !e.startsWith("AD") && !e.startsWith("chartInformation.json"));
    var map = {};

    airportList.forEach(e => {
        map[e] = {};

        chartTypes.forEach(f => {
            map[e][f] = fs.existsSync(`AIP/${effectiveAiracDate}/AD/${e}/${f}.pdf`);
            console.log(`AIP/${effectiveAiracDate}/AD/${e}/${f}.pdf : ${map[e][f]}`);
        });
    });

    fs.writeFileSync(`AIP/${effectiveAiracDate}/AD/chartInformation.json`, JSON.stringify(map, null, '\t'));

})();