const { Router } = require("express");
const moment = require("moment");
const scraper = require("../../scraper");

const router = new Router();

router.get("/getConsoleSold/:date", async (req, res) => {
  try {
    const date = req.params.date;
    if (!date) {
      return res.status(404).send("Invalid date");
    }
    const formattedDate = moment(date).format("MMM D, YYYY");
    console.log(formattedDate);

    const result = await scraper.getConsoleSoldByDate(formattedDate);

    res.status(200).send(result);
  } catch (e) {
    res.status(500).send("An error occured");
  }
});

module.exports = router;
