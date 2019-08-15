import {
  loadPageChunk,
  getPageIDFromUrl,
  setNotionPageID,
  queryCollection
} from "./api";
import { NotionBlock, NoitionQueryCollection } from "./model";

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

  pageChunk.then(async ({ recordMap }) => {
    const blocks: NotionBlock[] = Object.values(recordMap.block);
    for (const block of blocks) {
      if (block.value.type === "collection_view") {
        const collectionView: NoitionQueryCollection = await queryCollection({
          collectionId: block.value.collection_id as string,
          collectionViewId: block.value.view_ids[0]
        });
        const collection = collectionView.recordMap.collection;
        const entries = Object.values(collectionView.recordMap.block).filter(
          (entry: NotionBlock) =>
            entry.value && entry.value.parent_id === block.value.collection_id
        );
        for (const entry of entries) {
          if (entry.value.properties) {
            console.log(
              `Table title: [${
                collection[entry.value.parent_id].value.name[0]
              }]`,
              `Name col: [${entry.value.properties.title[0][0]}]`
            );
          }
        }
      }
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
