import { PlaywrightCrawler, RequestQueue, Dataset } from "crawlee";
import { embedText } from "./embed.js";
import lancedb from "@lancedb/lancedb";

const db = await lancedb.connect("./lancedb");

export const crawl = async (url: string, TableName: string) => {
  console.log("Received URL:", url);
  console.log("TableName:", TableName);

  const folder = TableName;
  const maxPagesToCrawl = 15;
  let pagesCrawled = 0;

  let batch: { vector: number[]; pageContents: string; url: string }[] = [];
  
  if ((await db.tableNames()).includes(folder)) {
    await db.dropTable(folder);
  }

  const tbl = await db.createTable(folder, [
    {
      vector: Array(3072).fill(0),
      pageContents: "",
      url: "",
    },
    {
      mode: "overwrite",
    },
  ]);

  function chunks(text: string, size = 2000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }

  const datasetName = await Dataset.open(folder);

  const requestQueue = await RequestQueue.open();
  await requestQueue.addRequest({ url });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxConcurrency: 1,
    minConcurrency: 1,
    async requestHandler({ request, page, enqueueLinks, log }) {
      if (pagesCrawled >= maxPagesToCrawl) {
        log.info("Reached max page limit. Stopping crawler...");
        await crawler.teardown();
        return;
      }

      pagesCrawled++;

      const title = await page.title();
      await page.waitForSelector("body");
      await page.evaluate(() => {
        const elements = document.querySelectorAll("style, noscript");
        elements.forEach((el) => el.remove());
      });

      const pageContents = await page.evaluate(() => document.body.innerText);
      log.info(`Title of ${request.loadedUrl} is '${title}'`);

      datasetName.pushData({
        title: title,
        pageContents: pageContents,
        url: request.loadedUrl,
      });

      const chunkarray = chunks(pageContents);
      for (const chunk of chunkarray) {
        const vector = await embedText(chunk);
        batch.push({
          vector: vector as number[],
          pageContents: chunk,
          url: request.loadedUrl,
        });
      }

      if (batch.length >= 20) {
        await tbl.add(batch as any);
        batch.length = 0;
      }

      await enqueueLinks({
        selector: "a",
        strategy: "same-domain",
      });
    },
  });
  console.log(`Crawling started: ${url}`);
  await crawler.run();
  await requestQueue?.drop();
  return { message: `Crawling for ${url} completed.` };
};
