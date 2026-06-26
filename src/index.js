/** @format
 * flenzo Music Bot
 * Developer: Yadav
 */

require("dotenv").config();
const { flenzoClient } = require("./client/flenzoClient");

const client = new flenzoClient();
client.start();

