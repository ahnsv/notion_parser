import { loadPageChunk, getPageIDFromUrl, setNotionPageID } from "./api";
import { NotionBlock } from "./model";

/**
 * Testing part
 */
try {
  const pageId = getPageIDFromUrl(
    "https://www.notion.so/taebae/cms-a7c23632abfa4682b3ecb62a39787655"
  );
  const meta = setNotionPageID(pageId as string);
  const pageChunk = loadPageChunk({
    pageId: meta.pageId,
    limit: 100,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false
  });

  pageChunk.then(({ recordMap }) => {
    // block -> Object.values() -> value -> properties -> title -> concat
    const blocks: NotionBlock[] = Object.values(recordMap.block);
    for (const block of blocks) {
      if (block.value.properties) {
        if (block.value.properties.title) {
          console.log(
            block.value.properties.title.reduce((prev, curr) => prev + curr, "")
          );
        }
      }
    }
  });
} catch (error) {
  console.log(error);
}
