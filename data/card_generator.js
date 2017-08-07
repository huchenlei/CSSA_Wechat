/**
 * This module generates the card ids for test usage
 * Created by Charlie on 2017-07-27.
 */

const crypto = require('crypto');
const fs = require('fs');
const assert = require('assert');
const encryptCardId = require('../utils/encrypter').encrypt;

const args = process.argv.slice(2); // the first 2 params are node and .js file

if (args.length === 0)
    console.log("Usage: node \<this_file_name\> \<card number\> \<public file output path\> \<private file output path\>");
const CARD_NUMBER = args[0] ? args[0] : 100; // card pool size
const OUTPUT_PUBLIC_FILE = args[1] ? args[1] : './card-pool-public.json'; // To be push on server and save in db
const OUTPUT_PRIVATE_FILE = args[2] ? args[2] : './card-pool-private.json'; // keep locally

let cardPool = [];
let encryptedCardPool = [];
for (let i = 0; i < CARD_NUMBER; i++) {
    let cardId = crypto.randomBytes(48).toString('hex');
    cardPool.push(cardId);
    encryptedCardPool.push(encryptCardId(cardId));
}

assert(encryptCardId(cardPool[0]) === encryptedCardPool[0], "Improper hash");

fs.writeFileSync(OUTPUT_PUBLIC_FILE, JSON.stringify(encryptedCardPool));
fs.writeFileSync(OUTPUT_PRIVATE_FILE, JSON.stringify(cardPool));
console.log(`Successfully generate ${CARD_NUMBER} card id in ${OUTPUT_PRIVATE_FILE}, 
please put corresponding public file ${OUTPUT_PUBLIC_FILE} on server database!`);
