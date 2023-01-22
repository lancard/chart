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
            // return;
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

function getLatestAiracDate() {
    const firstDate = dayjs('2020-01-02', 'YYYY-MM-DD');
    const now = dayjs().startOf('day');

    var diffDate = now.diff(firstDate, 'day') % 28 + 1;

    return now.add(-diffDate, 'day').format('YYYY-MM-DD');
}

// -------------------------------------
const latestAiracDate = (process.argv.length <= 2 ? getLatestAiracDate() : process.argv[2]);

const downloadMap = [
    "GEN/GEN 0.0.pdf",
    "GEN/GEN 0.1 PREFACE.pdf",
    "GEN/GEN 0.2 RECORD OF AIP AMENDMENTS.pdf",
    "GEN/GEN 0.3 RECORD OF AIP SUPPLEMENTS.pdf",
    "GEN/GEN 0.4 CHECKLIST OF AIP PAGES.pdf",
    "GEN/GEN 0.5 LIST OF HAND AMENDMENTS TO THE AIP.pdf",
    "GEN/GEN 0.6 TABLE OF CONTENTS TO PART I.pdf",
    "GEN/GEN 1.1 DESIGNATED AUTHORITIES.pdf",
    "GEN/GEN 1.2 ENTRY, TRANSIT AND DEPARTURE AIRCRAFT.pdf",
    "GEN/GEN 1.3 ENTRY, TRANSIT AND DEPARTURE OF PASSENGERS AND CREW.pdf",
    "GEN/GEN 1.4 ENTRY, TRANSIT AND DEPARTURE OF CARGO.pdf",
    "GEN/GEN 1.5 AIRCRAFT INSTRUMENTS, EQUIPMENT AND FLIGHT DOCUMENTS.pdf",
    "GEN/GEN 1.6 SUMMARY OF NATIONAL REGULATIONS AND INTERNATIONAL  AGREEMENTS.pdf",
    "GEN/GEN 1.7 DIFFERNCES FROM ICAO STANDARDS, RECOMMENDED.pdf",
    "GEN/GEN 2.1 MEASURING SYSTEM, AIRCRAFT MARKINGS, HOLYDAYS.pdf",
    "GEN/GEN 2.2 ABBREVIATIONS USED IN AIS PUBLICATIONS.pdf",
    "GEN/GEN 2.3 CHART SYMBOLS.pdf",
    "GEN/GEN 2.4 LOCATION INDICATORS.pdf",
    "GEN/GEN 2.5 LIST OF RADIO NAVIGATION AIDS.pdf",
    "GEN/GEN 2.6 CONVERSION OF UNITS OF MEASUREMENT.pdf",
    "GEN/GEN 2.7 SUNRISE SUNSET.pdf",
    "GEN/GEN 3.1 AERONAUTICAL INFORMATION SERVICES.pdf",
    "GEN/GEN 3.2 AERONAUTICAL CHARTS.pdf",
    "GEN/GEN 3.3 AIRTRAFFIC SERVICES.pdf",
    "GEN/GEN 3.4 COMMUNICATIONS SERVICES.pdf",
    "GEN/GEN 3.5 METEOROLOGICAL SERVICES.pdf",
    "GEN/GEN 3.6 SEARCH AND RESCUE.pdf",
    "GEN/GEN 4.1 AERODROME CHARGE.pdf",
    "GEN/GEN 4.2 AIR NAVIGATION SERVICES CHARGES.pdf",

    "ENR/ENR 0.0.pdf",
    "ENR/ENR 0.6.pdf",
    "ENR/ENR 1.1.pdf",
    "ENR/ENR 1.2.pdf",
    "ENR/ENR 1.3.pdf",
    "ENR/ENR 1.4.pdf",
    "ENR/ENR 1.5.pdf",
    "ENR/ENR 1.6.pdf",
    "ENR/ENR 1.7.pdf",
    "ENR/ENR 1.8.pdf",
    "ENR/ENR 1.9.pdf",
    "ENR/ENR 1.10.pdf",
    "ENR/ENR 1.11.pdf",
    "ENR/ENR 1.12.pdf",
    "ENR/ENR 1.13.pdf",
    "ENR/ENR 1.14.pdf",
    "ENR/ENR 2.1.pdf",
    "ENR/ENR 2.2.pdf",
    "ENR/ENR 3.1.pdf",
    "ENR/ENR 3.2.pdf",
    "ENR/ENR 3.3.pdf",
    "ENR/ENR 3.4.pdf",
    "ENR/ENR 4.1.pdf",
    "ENR/ENR 4.2.pdf",
    "ENR/ENR 4.3.pdf",
    "ENR/ENR 4.4.pdf",
    "ENR/ENR 4.5.pdf",
    "ENR/ENR 5.1.pdf",
    "ENR/ENR 5.2.pdf",
    "ENR/ENR 5.3.pdf",
    "ENR/ENR 5.4.pdf",
    "ENR/ENR 5.5.pdf",
    "ENR/ENR 5.6.pdf",
    "ENR/ENR 6.1.pdf",

    "AD/AD 0.6.pdf",
    "AD/AD 1.1.pdf",
    "AD/AD 1.2.pdf",
    "AD/AD 1.3.pdf",
    "AD/AD 1.4.pdf",
    "AD/AD 1.5.pdf",

    "AD/RKSI/RKSI-TEXT.pdf",
    "AD/RKSS/RKSS-TEXT.pdf",
    "AD/RKPC/RKPC-TEXT.pdf",
    "AD/RKPK/RKPK-TEXT.pdf",
    "AD/RKTU/RKTU-TEXT.pdf",
    "AD/RKNY/RKNY-TEXT.pdf",
    "AD/RKTN/RKTN-TEXT.pdf",
    "AD/RKJB/RKJB-TEXT.pdf",
    "AD/RKJJ/RKJJ-TEXT.pdf",
    "AD/RKJK/RKJK-TEXT.pdf",
    "AD/RKJY/RKJY-TEXT.pdf",
    "AD/RKNW/RKNW-TEXT.pdf",
    "AD/RKPS/RKPS-TEXT.pdf",
    "AD/RKPU/RKPU-TEXT.pdf",
    "AD/RKSM/RKSM-TEXT.pdf",
    "AD/RKTH/RKTH-TEXT.pdf",
    "AD/RKTL/RKTL-TEXT.pdf",
    "AD/RKPD/RKPD-TEXT.pdf"
];

downloadMap.forEach(element => {
    download(encodeURI(`https://aim.koca.go.kr/eaipPub/Package/${latestAiracDate}/pdf/${element}`), `AIP/${latestAiracDate}/${element}`);
    download(encodeURI(`https://aim.koca.go.kr/eaipPub/Package/${latestAiracDate}-AIRAC/pdf/${element}`), `AIP/${latestAiracDate}/${element}`);
});

const airportList = [
    "RKSI",
    "RKSS",
    "RKPC",
    "RKPK",
    "RKTU",
    "RKNY",
    "RKTN",
    "RKJB",
    "RKJJ",
    "RKJK",
    "RKJY",
    "RKNW",
    "RKPS",
    "RKPU",
    "RKSM",
    "RKTH",
    "RKTL",
    "RKPD"
];

function downloadAttachment(airport, body) {
    const $ = cheerio.load(body);
    const $pdfList = $("a[href$=\\.pdf]");
    var textMap = {};

    for (var a = 0; a < $pdfList.length; a++) {
        let url = $pdfList.eq(a).attr('href');
        if (url[0] == '/') url = "https://aim.koca.go.kr" + url;
        url = url.split("http://").join("https://");
        let text = $pdfList.eq(a).text().trim();
        textMap[text] = url;
    }

    // console.dir(textMap);

    for (var text in textMap) {
        download(textMap[text], `AIP/${latestAiracDate}/AD/${airport}/${text}.pdf`);
    }
}

airportList.forEach(airport => {
    downloadText(encodeURI(`https://aim.koca.go.kr/eaipPub/Package/${latestAiracDate}/html/eAIP/KR-AD-2.${airport}-en-GB.html`), (body) => { downloadAttachment(airport, body) });
    downloadText(encodeURI(`https://aim.koca.go.kr/eaipPub/Package/${latestAiracDate}-AIRAC/html/eAIP/KR-AD-2.${airport}-en-GB.html`), (body) => { downloadAttachment(airport, body) });
});


