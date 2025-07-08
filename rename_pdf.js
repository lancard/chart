const fs = require('fs');
const path = require('path');

if (process.argv.length <= 2) {
    console.log("usage: node index.js 2023-04-22");
    process.exit(0);
}

const effectiveAiracDate = process.argv[2].substring(0, 10);

function renameFile(filePath) {
    var fileInfo = path.parse(filePath);
    var dirname = fileInfo.dir;
    var basename = fileInfo.name.split(".pdf").join("");

    if (basename.endsWith("-TEXT")) {
        fs.renameSync(filePath, path.join(dirname, "TEXT.pdf"));
        return;
    }
    if (basename.startsWith("GEN ")) {
        fs.renameSync(filePath, path.join(dirname, basename.split(" ")[0] + " " + basename.split(" ")[1] + ".pdf"));
        return;
    }

    // AD charts ------------------------
    var targetFileName = basename;
    if (basename.startsWith("(2-")) {
        targetFileName = basename.split(") ")[1];
    }
    targetFileName = targetFileName.split("BIRD CONCENTRATES").join("BIRD CONCENTRATION");
    targetFileName = targetFileName.split("AERODROME").join("AD");
    if(targetFileName == "PARKING DOCKING CHART") {
        targetFileName = "AIRCRAFT PARKING DOCKING CHART";
    }
    if(targetFileName == "AD OBST CHART") {
        targetFileName = "AD OBSTACLE CHART TYPE A";
    }
    if(targetFileName.indexOf("PRECISION") >= 0 && targetFileName.indexOf("TERRAIN") >= 0) {
        targetFileName = "PRECISION APP TERRAIN CHART";
    }
    if(targetFileName == "INSTRUMENT APPROACH CHART") {
        targetFileName = "INSTR APCH CHART";
    }
    
    fs.renameSync(filePath, path.join(dirname, targetFileName + ".pdf"));
}

function followDir(dir) {
    if (fs.statSync(dir).isFile()) {
        renameFile(dir);
        return;
    }
    var subdir = fs.readdirSync(dir);
    subdir.forEach(d => {
        followDir(path.join(dir, d));
    });
}

followDir(`AIP/${effectiveAiracDate}`);


