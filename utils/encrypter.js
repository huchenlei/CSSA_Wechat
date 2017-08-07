/**
 * Created by Charlie on 2017-07-27.
 */

const crypto = require('crypto');
function encryptCardId(cardId) {
    return crypto.createHash('sha256').update(cardId).digest('base64');
}

module.exports = {
    "encrypt": encryptCardId
};