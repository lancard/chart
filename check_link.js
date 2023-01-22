const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html').toString();

const $ = cheerio.load(html);
$button = $("button[onclick]")
for (var a = 0; a < $button.length; a++) {
    let path = $button.eq(a).attr('onclick').substring(10).split("')").join("");
    var fullPath = `AIP/${process.argv[2]}/${path}`;
    if (fs.existsSync(fullPath))
        continue;
    console.dir(fullPath);
}
