/**
 * This file generates the qr code image for certain card-pool .json file
 * Created by Charlie on 2017-07-31.
 */

const fs = require('fs');
const fsExtra = require('fs-extra');
const qrcode = require('qrcode');

function zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return new Array(+(zero > 0 && zero)).join("0") + num;
}

const args = process.argv.slice(2); // the first 2 params are node and .js file

if (args.length === 0)
    console.log("Usage: node <THIS_FILE.js> <DATA_FILE> <OUTPUT_DIR> <HTML_OUTPUT_FILE> <COL_NUM>");
const DATA_FILE = args[0] ? args[0] : './card-pool-private.json';
const OUTPUT_DIR = args[1] ? args[1] : './qrcode-img';
const HTML_OUTPUT_FILE = args[2] ? args[2] : './qrcode.html';
const COL_NUM = args[3] ? args[3] : 3; // number of table column(td) in output html file

// const SERVER_ADDRESS = "138.197.149.174";
const SERVER_ADDRESS = "utcssa.info";
const SERVER_ROUTE = "/user/convert/qrcode";

if (fs.existsSync(OUTPUT_DIR)) fsExtra.removeSync(OUTPUT_DIR); // Delete the original dir if it already existse
fs.mkdirSync(OUTPUT_DIR);

const cardPool = JSON.parse(fs.readFileSync(DATA_FILE));
let qrcodeImgList = [];
let indexSpanList = [];

for (let i = 0; i < cardPool.length; i++) {
    const fileName = `${OUTPUT_DIR}/qrcode${i}.png`;
    const url = `http://${SERVER_ADDRESS}${SERVER_ROUTE}?serial=${cardPool[i]}`;
    // Generate qrcode file
    qrcode.toFile(fileName, url, {errorCorrectionLevel: 'M'}, (err) => {
        if (err) throw err; // temp error handling
    });
    // reference qrcode file in html
    qrcodeImgList.push(`<td><img src="${fileName}"></td>`);
    indexSpanList.push(`<td><span>No.${zeroPad(1000 + i, 6)}</span></td>`);
}

// format the html for printing
let dataStr = '';
for (let i = 0; i < cardPool.length; i += COL_NUM) {
    let imgRow = '';
    let spanRow = '';
    for (let j = 0; j < COL_NUM; j++) {
        if (i + j >= cardPool.length) break;
        imgRow = imgRow + qrcodeImgList[i + j];
        spanRow = spanRow + indexSpanList[i + j];
    }
    dataStr = dataStr + `<table><tr>${imgRow}</tr><tr>${spanRow}</tr></table>`;
}

const html_template = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>QR-Codes</title>
	</head>
	<style media="screen">
		table {
			display: inline-block;
			margin: 10px;
			border: 0;
		}
		td, span {
			text-align: center;
		}
	</style>
	<body>
${dataStr}		
	</body>
</html>
`;

fs.writeFileSync(HTML_OUTPUT_FILE, html_template);

console.log(`Complete. Image files saved to ${OUTPUT_DIR}, HTML file saved to ${HTML_OUTPUT_FILE}.`);