const fs = require('fs');
const https = require('https');
const path = require('path');
const dayjs = require('dayjs');
const cheerio = require('cheerio');

var downloadDelay = (process.env.CI ? 10000 : 300);
var downloadDelayCount = 0;
var downloadCount = 0;

function download(url, filePath) {
    try {
        var info = fs.statSync(filePath);
        if (info.size > 1000) {
            console.log(`already downloaded. skip: ${url}`);
            return;
        }
    }
    catch (e) {
    }

    setTimeout(() => {
        console.log(`download: ${url}`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        downloadCount++;
        https.get(url, (response) => {
            if (response.statusCode != 200) {
                console.log(`failed: ${response.statusCode} ${url}`);
                downloadCount--;
                return;
            }
            response.pipe(fs.createWriteStream(filePath));
            response.on('end', () => {
                downloadCount--;
                console.log(`complete(${downloadCount}): ${url}`);
            });
        }).on('error', (e) => {
            console.log(`failed: ${url}`);
            console.error(e);
            process.exit(7);
        });
    }, downloadDelayCount);

    downloadDelayCount += downloadDelay;
}

function downloadText(url, callback) {
    https.get(url, (response) => {
        if (response.statusCode != 200) {
            console.log(`failed: ${response.statusCode} ${url}`);
            return;
        }

        let body = '';

        response.on('data', (data) => {
            body += data.toString();
        });

        response.on('end', () => {
            callback(body);
        });
    });
}

// -------------------------------------
if (process.argv.length <= 2) {
    console.log("usage: node index.js 2023-04-19-AIRAC");
    process.exit(0);
}

const effectiveAiracDate = process.argv[2];

// source from aim.koca.go.kr --------------------------------------------------------
var PDF_LOCATION = "../pdf/";
var HTML_LOCATION = /\/html\/\D{4}\//;
function getAsPdf(href) {
    var value = new String(href);
    var search = ".html";
    var replace = ".pdf";
    var value2 = value.replace(search, replace);
    search = HTML_LOCATION;
    replace = PDF_LOCATION;

    var pdfLocation = "/pdf";
    var lastIdx = value2.lastIndexOf("/");

    var preValue = value2.substring(0, lastIdx);
    if (preValue.match(/\/pdf$/) != null) {
        pdfLocation = "";
    }

    //pdf name setting ../pdf/RKSI-TEXT.pdf
    var postValue = value2.substring(lastIdx);

    var name = postValue.split("-");
    var pdfName = "";

    var pdfName2 = name[1] + name[2];
    switch (name[1]) {

        case "GEN":
            pdfName += "GEN/";

            switch (pdfName2) {
                case "GEN0": pdfName += "GEN 0.0.pdf"; break;
                case "GEN0.1": pdfName += "GEN 0.1 PREFACE.pdf"; break;
                case "GEN0.2": pdfName += "GEN 0.2 RECORD OF AIP AMENDMENTS.pdf"; break;
                case "GEN0.3": pdfName += "GEN 0.3 RECORD OF AIP SUPPLEMENTS.pdf"; break;
                case "GEN0.4": pdfName += "GEN 0.4 CHECKLIST OF AIP PAGES.pdf"; break;
                case "GEN0.5": pdfName += "GEN 0.5 LIST OF HAND AMENDMENTS TO THE AIP"; break;
                case "GEN0.6": pdfName += "GEN 0.6 TABLE OF CONTENTS TO PART I.pdf"; break;
                case "GEN1": pdfName += "GEN 1.1 DESIGNATED AUTHORITIES.pdf"; break;
                case "GEN1.1": pdfName += "GEN 1.1 DESIGNATED AUTHORITIES.pdf"; break;
                case "GEN1.2": pdfName += "GEN 1.2 ENTRY, TRANSIT AND DEPARTURE AIRCRAFT.pdf"; break;
                case "GEN1.3": pdfName += "GEN 1.3 ENTRY, TRANSIT AND DEPARTURE OF PASSENGERS AND CREW.pdf"; break;
                case "GEN1.4": pdfName += "GEN 1.4 ENTRY, TRANSIT AND DEPARTURE OF CARGO.pdf"; break;
                case "GEN1.5": pdfName += "GEN 1.5 AIRCRAFT INSTRUMENTS, EQUIPMENT AND FLIGHT DOCUMENTS.pdf"; break;
                case "GEN1.6": pdfName += "GEN 1.6 SUMMARY OF NATIONAL REGULATIONS AND INTERNATIONAL  AGREEMENTS.pdf"; break;
                case "GEN1.7": pdfName += "GEN 1.7 DIFFERNCES FROM ICAO STANDARDS, RECOMMENDED.pdf"; break;
                case "GEN2": pdfName += "GEN 2.1 MEASURING SYSTEM, AIRCRAFT MARKINGS, HOLYDAYS.pdf"; break;
                case "GEN2.1": pdfName += "GEN 2.1 MEASURING SYSTEM, AIRCRAFT MARKINGS, HOLYDAYS.pdf"; break;
                case "GEN2.2": pdfName += "GEN 2.2 ABBREVIATIONS USED IN AIS PUBLICATIONS.pdf"; break;
                case "GEN2.3": pdfName += "GEN 2.3 CHART SYMBOLS.pdf"; break;
                case "GEN2.4": pdfName += "GEN 2.4 LOCATION INDICATORS.pdf"; break;
                case "GEN2.5": pdfName += "GEN 2.5 LIST OF RADIO NAVIGATION AIDS.pdf"; break;
                case "GEN2.6": pdfName += "GEN 2.6 CONVERSION OF UNITS OF MEASUREMENT.pdf"; break;
                case "GEN2.7": pdfName += "GEN 2.7 SUNRISE SUNSET.pdf"; break;
                case "GEN3": pdfName += "GEN 3.1 AERONAUTICAL INFORMATION SERVICES.pdf"; break;
                case "GEN3.1": pdfName += "GEN 3.1 AERONAUTICAL INFORMATION SERVICES.pdf"; break;
                case "GEN3.2": pdfName += "GEN 3.2 AERONAUTICAL CHARTS.pdf"; break;
                case "GEN3.3": pdfName += "GEN 3.3 AIRTRAFFIC SERVICES.pdf"; break;
                case "GEN3.4": pdfName += "GEN 3.4 COMMUNICATIONS SERVICES.pdf"; break;
                case "GEN3.5": pdfName += "GEN 3.5 METEOROLOGICAL SERVICES.pdf"; break;
                case "GEN3.6": pdfName += "GEN 3.6 SEARCH AND RESCUE.pdf"; break;
                case "GEN4": pdfName += "GEN 4.1 AERODROME CHARGE.pdf"; break;
                case "GEN4.1": pdfName += "GEN 4.1 AERODROME CHARGE.pdf"; break;
                case "GEN4.2": pdfName += "GEN 4.2 AIR NAVIGATION SERVICES CHARGES.pdf"; break;

            }
            break;

        case "ENR":
            pdfName += "ENR/";
            switch (pdfName2) {
                case "ENR": pdfName += "ENR 0.0.pdf"; break;
                case "ENR0.1": return null;
                case "ENR0.2": return null;
                case "ENR0.3": return null;
                case "ENR0.4": return null;
                case "ENR0.5": return null;
                case "ENR0.6": pdfName += "ENR 0.6.pdf"; break;
                case "ENR1": pdfName += "ENR 1.1.pdf"; break;
                case "ENR1.1": pdfName += "ENR 1.1.pdf"; break;
                case "ENR1.2": pdfName += "ENR 1.2.pdf"; break;
                case "ENR1.3": pdfName += "ENR 1.3.pdf"; break;
                case "ENR1.4": pdfName += "ENR 1.4.pdf"; break;
                case "ENR1.5": pdfName += "ENR 1.5.pdf"; break;
                case "ENR1.6": pdfName += "ENR 1.6.pdf"; break;
                case "ENR1.7": pdfName += "ENR 1.7.pdf"; break;
                case "ENR1.8": pdfName += "ENR 1.8.pdf"; break;
                case "ENR1.9": pdfName += "ENR 1.9.pdf"; break;
                case "ENR1.10": pdfName += "ENR 1.10.pdf"; break;
                case "ENR1.11": pdfName += "ENR 1.11.pdf"; break;
                case "ENR1.12": pdfName += "ENR 1.12.pdf"; break;
                case "ENR1.13": pdfName += "ENR 1.13.pdf"; break;
                case "ENR1.14": pdfName += "ENR 1.14.pdf"; break;
                case "ENR2": pdfName += "ENR 2.1.pdf"; break;
                case "ENR2.1": pdfName += "ENR 2.1.pdf"; break;
                case "ENR2.2": pdfName += "ENR 2.2.pdf"; break;
                case "ENR3": pdfName += "ENR 3.1.pdf"; break;
                case "ENR3.1": pdfName += "ENR 3.1.pdf"; break;
                case "ENR3.3": pdfName += "ENR 3.2.pdf"; break;
                case "ENR3.5": pdfName += "ENR 3.3.pdf"; break;
                case "ENR3.6": pdfName += "ENR 3.4.pdf"; break;
                case "ENR4": pdfName += "ENR 4.1.pdf"; break;
                case "ENR4.1": pdfName += "ENR 4.1.pdf"; break;
                case "ENR4.2": pdfName += "ENR 4.2.pdf"; break;
                case "ENR4.3": pdfName += "ENR 4.3.pdf"; break;
                case "ENR4.4": pdfName += "ENR 4.4.pdf"; break;
                case "ENR4.5": pdfName += "ENR 4.5.pdf"; break;
                case "ENR5": pdfName += "ENR 5.1.pdf"; break;
                case "ENR5.1": pdfName += "ENR 5.1.pdf"; break;
                case "ENR5.2": pdfName += "ENR 5.2.pdf"; break;
                case "ENR5.3": pdfName += "ENR 5.3.pdf"; break;
                case "ENR5.4": pdfName += "ENR 5.4.pdf"; break;
                case "ENR5.5": pdfName += "ENR 5.5.pdf"; break;
                case "ENR5.6": pdfName += "ENR 5.6.pdf"; break;
                case "ENR6": pdfName += "ENR 6.1.pdf"; break;
            }
            break;

        case "AD":
            pdfName += "AD/";
            switch (pdfName2) {
                case "AD0.1": return null;
                case "AD0.2": return null;
                case "AD0.3": return null;
                case "AD0.4": return null;
                case "AD0.5": return null;
                case "AD0.6": pdfName += "AD 0.6.pdf"; break;
                case "AD1.1": pdfName += "AD 1.1.pdf"; break;
                case "AD1.2": pdfName += "AD 1.2.pdf"; break;
                case "AD1.3": pdfName += "AD 1.3.pdf"; break;
                case "AD1.4": pdfName += "AD 1.4.pdf"; break;
                case "AD1.5": pdfName += "AD 1.5.pdf"; break;
                default:
                    pdfName += name[2].substring(2, 6) + "/" + name[2].substring(2, 6) + "-TEXT.pdf";
                    break;
            }
            break;

        case "cover":
            return null;
    }

    return PDF_LOCATION + pdfName;
}
// source from aim.koca.go.kr --------------------------------------------------------

function convertPdfName(filename) {
    var dirname = path.dirname(filename);
    var basename = path.basename(filename);

    if (basename.endsWith("-TEXT.pdf")) {
        return dirname + "/TEXT.pdf";
    }

    if (basename.startsWith("GEN ")) {
        return dirname + "/" + basename.split(" ")[0] + " " + basename.split(" ")[1] + ".pdf";
    }
    if (basename.startsWith("ENR ")) {
        return dirname + "/" + basename.split(" ")[0] + " " + basename.split(" ")[1];
    }
    if (basename.startsWith("AD ")) {
        return dirname + "/" + basename.split(" ")[0] + " " + basename.split(" ")[1];
    }

    if (basename.includes("AD CHART") || basename.includes("AERODROME CHART"))
        basename = "AD CHART.pdf";
    else if (basename.includes("AD OBSTACLE CHART TYPE A")) {
        basename = "AD OBSTACLE CHART TYPE A.pdf";
    }
    else if (basename.includes("AD OBSTACLE CHART TYPE B")) {
        basename = "AD OBSTACLE CHART TYPE B.pdf";
    }
    else if (basename.includes("OBSTACLE") || basename.includes("OBST CHART")) {
        basename = "AD OBSTACLE CHART TYPE A.pdf";
    }
    else if (basename.includes("BIRD CON")) {
        basename = "BIRD CONCENTRATION CHART.pdf";
    }
    else if (basename.includes("INSTR APCH") || basename.includes("INSTRUMENT APPROACH")) {
        basename = "INSTR APCH CHART.pdf";
    }
    else if (basename.includes("VISUAL APCH")) {
        basename = "VISUAL APCH CHART.pdf";
    }
    else if (basename.includes("STAR")) {
        basename = "STAR.pdf";
    }
    else if (basename.includes("SID")) {
        basename = "SID.pdf";
    }
    else if (basename.includes("PARKING DOCKING")) {
        basename = "AIRCRAFT PARKING DOCKING CHART.pdf";
    }
    else if (basename.includes("(2-41) AREA CHART") || basename.includes("AREA CHART(ARR)")) {
        basename = "AREA CHART - ICAO (ARR).pdf";
    }
    else if (basename.includes("(2-27) AREA CHART") || basename.includes("AREA CHART(DEP)")) {
        basename = "AREA CHART - ICAO (DEP).pdf";
    }
    else if (basename.includes("AREA CHART")) {
        basename = "AREA CHART.pdf";
    }
    else if (basename.includes("ATC SURVEILLANCE MINIMUM ALTITUDE CHART") || basename.includes("(2-10) ATC.pdf")) {
        basename = "ATC SURVEILLANCE MINIMUM ALTITUDE CHART.pdf";
    }
    else if (basename.includes("AD GROUND MOVEMENT CHART")) {
        basename = "AD GROUND MOVEMENT CHART.pdf";
    }
    else if (basename.includes("PRECISION") && basename.includes("TERRAIN CHART")) {
        basename = "PRECISION APP TERRAIN CHART.pdf";
    }

    return dirname + "/" + basename;
}



const urlPrefix = `https://aim.koca.go.kr/eaipPub/Package/${effectiveAiracDate}/`;
const menuUrl = urlPrefix + 'html/eAIP/KR-menu-en-GB.html';
const localPrefix = `./AIP/${effectiveAiracDate.substring(0, 10)}`;

function parseAerodromeHtml(body) {
    const $ = cheerio.load(body);
    const $a = $("div.Figure-Left:not(.AmdtDeletedNon-AIRAC):not(.AmdtDeleted) a")
    const downloadMap = {};

    for (var a = 0; a < $a.length; a++) {
        var href = $a.eq(a).attr("href");
        if (!href.endsWith(".pdf"))
            continue;

        var downloadUrl = href.split("http://").join("https://");
        if (downloadUrl.startsWith("/")) {
            downloadUrl = "https://aim.koca.go.kr" + downloadUrl;
        }
        var filePath = `${localPrefix}/AD/${downloadUrl.split("/AD/")[1]}`;
        filePath = filePath.split("  ").join(" ");

        downloadMap[downloadUrl] = filePath;
    }

    for (var d in downloadMap) {
        download(d, convertPdfName(downloadMap[d]));
    }
}

function parseMenuHtml(body) {
    const $ = cheerio.load(body);
    const $a = $("a");
    const downloadPdfMap = {};
    const attachmentPdfMap = {};

    for (var a = 0; a < $a.length; a++) {
        var href = $a.eq(a).attr("href");
        if (href.includes("KR-AD-2")) {
            var attachmentUrl = `${urlPrefix}html/${href.split("#")[0].split("../").join("")}`;
            attachmentPdfMap[attachmentUrl] = true;
        }
        var result = getAsPdf(href);
        if (result == null || !result.endsWith(".pdf"))
            continue;

        var fullDownloadUrl = result.split("../").join(`https://aim.koca.go.kr/eaipPub/Package/${effectiveAiracDate}/`);
        var filepath = result.split("../pdf").join(localPrefix).split("  ").join(" ");

        downloadPdfMap[fullDownloadUrl] = filepath;
    }

    for (var url in attachmentPdfMap) {
        downloadText(url, (body) => {
            parseAerodromeHtml(body);
        });
    }

    for (var url in downloadPdfMap) {
        download(url, convertPdfName(downloadPdfMap[url]));
    }
}

downloadText(menuUrl, (body) => {
    parseMenuHtml(body);
});
