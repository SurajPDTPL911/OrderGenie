import cron from 'node-cron';
import { resetCounts } from './utils.js'

console.log("Cron job initialized and waiting for schedule...");

cron.schedule("0 0 1 * *", async () => {
    console.log("Cron job running and reseting the counts");
    await resetCounts();
});

