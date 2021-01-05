const { CronJob } = require("cron");
const moment = require("moment");
const ebayScraper = require("../scraper");

console.log("Scheduler started");
const getConsoleSold = new CronJob("59 23 * * *", async () => {
  const date = new Date().toJSON();
  const formattedDate = moment(date).format("MMM D, YYYY");
  await ebayScraper.getConsoleSoldDate(formattedDate);
});

getConsoleSold.start();
