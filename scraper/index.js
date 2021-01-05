const { Cluster } = require("puppeteer-cluster");

let ps5 = [];
let xbox = [];

//ebay web sraper
const scrape = async () => {
  //create a cluster instance
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteerOptions: {
      headless: false,
    },
    monitor: true,
  });

  //scrapes the data off each page
  const getAllSoldPs5OnPage = async ({ page, data: url }) => {
    //go to the url
    await page.goto(url);
    console.log("Extracting data from: ", url);

    const result = await page.evaluate(() => {
      let ps5Onpage = document.querySelectorAll(
        "span[class=s-item__title--tagblock__COMPLETED] > span[class=POSITIVE]"
      );
      return Array.from(ps5Onpage).map((e) => e.innerText.trim().slice(5));
    });

    //if there are no results from the existing page, end the recursion
    if (result.length == 0) {
      return;
    }

    //adds the result of the scrape to the existing one;
    ps5 = ps5.concat(result);

    //get the next page number and hence, generate the next URL for the recursion
    const nextPageNumber = parseInt(url.match(/_pgn=(\d+)$/)[1], 10) + 1;
    const nextURL = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=ps5&_sacat=0&LH_Sold=1&LH_Complete=1&LH_PrefLoc=0&_ipg=200&_pgn=${nextPageNumber}`;

    //queue up the next url and scrape the data
    cluster.queue(nextURL, getAllSoldPs5OnPage);
  };

  const getAllSoldXboxOnPage = async ({ page, data: url }) => {
    //open a url in a page
    await page.goto(url);
    console.log("scraping: ", url);

    // scrape the url
    const result = await page.evaluate(() => {
      let xboxOnPage = document.querySelectorAll(
        "span[class=s-item__title--tagblock__COMPLETED] > span[class=POSITIVE]"
      );

      return Array.from(xboxOnPage).map((e) => e.innerText.trim().slice(5));
    });

    if (result.length < 1) {
      return result;
    }
    const nextPageNumber = parseInt(url.match(/_pgn=(\d+)$/)[1], 10) + 1;
    const nextURL = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=ps5&_sacat=0&LH_Sold=1&LH_Complete=1&LH_PrefLoc=0&_ipg=200&_pgn=${nextPageNumber}`;
    xbox = xbox.concat(result);
    cluster.queue(nextURL, getAllSoldXboxOnPage);
  };

  cluster.queue(
    "https://www.ebay.com/sch/i.html?_from=R40&_nkw=ps5&_sacat=0&LH_Sold=1&LH_Complete=1&LH_PrefLoc=0&_ipg=200&_pgn=1",
    getAllSoldPs5OnPage
  );

  cluster.queue(
    "https://www.ebay.com/sch/i.html?_from=R40&_nkw=ps5&_sacat=0&LH_Sold=1&LH_Complete=1&LH_PrefLoc=0&_ipg=200&_pgn=1",
    getAllSoldXboxOnPage
  );

  await cluster.idle();
  await cluster.close();
};

module.exports.getConsoleSoldByDate = async (date) => {
  await scrape();
  return {
    ps5: ps5.filter((d) => d === date).length,
    xbox: xbox.filter((d) => d === date).length,
  };
};
