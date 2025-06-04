import { PlaywrightCrawler } from "crawlee";
import lancedb from "@lancedb/lancedb";
import { embedText } from "./embed.js";

const databaseDir = "./lancedb";
const db = await lancedb.connect(databaseDir);

export const crawl = async (url: string, Tablename: string) => {
  console.log("Received URL:", url);
  console.log("Tablename:", Tablename);

  const folder = Tablename;
  const tableNames = await db.tableNames();

  let tbl;

  if (tableNames.includes(Tablename)) {
    tbl = await db.openTable(Tablename);
  } else {
    console.log("Creating new table......");
    tbl = await db.createTable(
      Tablename,
      [{ vector: Array(3072).fill(0), pageContents: "", url: "" }],
      { mode: "overwrite" }
    );
  }

  function chunkText(text: string, chunkSize = 2000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  try {
    const BATCH_SIZE = 10;
    let processedCount = 0;
    const maxPagestoCrawl = 10;
    const batch: { vector: number[]; pageContents: string; url: string }[] = [];
    const crawler = new PlaywrightCrawler({
      launchContext: {
        launchOptions: {
          headless: true,
        },
      },
      minConcurrency: 1,
      maxConcurrency: 1,
      async requestHandler({ request, page, enqueueLinks, log }) {
        if (processedCount >= maxPagestoCrawl) {
          await crawler.teardown();
          console.log("reached max pages to crawl");
          return;
        }

        const title = await page.title();

        await page.waitForSelector("body");
        await page.evaluate(() => {
          const elements = document.querySelectorAll("style, noscript");
          elements.forEach((el) => el.remove());
        });

        const pageContents = await page.evaluate(() => document.body.innerText);

        log.info(`Title of ${request.loadedUrl} is '${title}'`);

        const pageChunks = chunkText(pageContents);

        for (let i = 0; i < pageChunks.length; i++) {
          const vector = await embedText(pageChunks[i]);
          batch.push({
            vector,
            pageContents: pageChunks[i],
            url: request.loadedUrl,
          });
        }

        if (batch.length >= BATCH_SIZE) {
          console.log("Batch length:", batch.length);
          await tbl.add(batch);
          batch.length = 0;
        }

        if (processedCount === maxPagestoCrawl - 1) {
          crawler.teardown();
          await tbl.add(batch);
        }

        processedCount++;
        await enqueueLinks();
      },
    });
    console.log(`Crawling started ${url}`);
    await crawler.run([url]);
    return { message: `Crawling stored successfully in folder ${folder}` };
  } catch (error) {
    console.error("Crawler encountered an error:", error);
    return { message: "Crawler encountered an error" };
  }
};
