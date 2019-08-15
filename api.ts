import { NOTION_URL, NOTION_URL_REGEX } from "./constants";
import {
  LPCRequestBody,
  NotionAPIEnum,
  NotionBlock,
  NotionQueryCollection,
  QCRequestBody
} from "./model";

const fetch = require("node-fetch");

/**
 * 노션 page ID 포맷에 맞게 파싱
 * @param url
 */
const parseToNotionPageIdFormat = (url: string) =>
  `${url.substr(0, 8)}-${url.substr(8, 4)}-${url.substr(12, 4)}-${url.substr(
    16,
    4
  )}-${url.substr(20, 12)}`;

/**
 * @description Notion 페이지 ID store
 */
const tempTargetNotionPageMeta = {
  pageId: "",
  token: ""
};
const setNotionPageID = (pageId: string) => {
  return Object.assign(tempTargetNotionPageMeta, { pageId: pageId });
};
const getPageIDFromUrl = (url: string) => {
  // notion url 아니면 에러
  if (!NOTION_URL_REGEX.test(url)) {
    throw new Error("올바른 노션 주소가 아닙니다");
  }
  const rawPageID = url.split(NOTION_URL)[1].slice(-32);
  const pageID = parseToNotionPageIdFormat(rawPageID);
  return pageID;
};

/**
 * @description Handling promise responses
 * @license https://github.com/zeit/spr-landing/blob/fed52dccf9e7f39cada283e4c487a2ed9d80ae30/data/notion.js#L110
 * @param res {Response}
 */

async function getError(res: Response) {
  return new Error(
    `Notion API error (${res.status}) \n${
      res.statusText
    }\n ${await getBodyOrNull(res)}`
  );
}

function getJSONHeaders(res: Response) {
  return JSON.stringify(res.headers.get(""));
}

function getBodyOrNull(res: Response) {
  try {
    return res.text();
  } catch (err) {
    return null;
  }
}

/**
 * 노션 API로 매핑
 * @param fnName
 * @param body
 */
const mapToNotionAPI = async (
  fnName: NotionAPIEnum,
  body: LPCRequestBody | QCRequestBody
) => {
  const res = await fetch(`https://www.notion.so/api/v3/${fnName}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    return res.json();
  } else {
    const error = await getError(res);
    console.log(error);
    throw error;
  }
};

/**
 * @description 노션 페이지 로드
 */
const loadPageChunk = async ({
  pageId = tempTargetNotionPageMeta.pageId,
  limit = 100,
  cursor = { stack: [] },
  chunkNumber = 0,
  verticalColumns = false
}: LPCRequestBody) =>
  await mapToNotionAPI(NotionAPIEnum.LOAD_PAGE_CHUNK, {
    pageId,
    limit,
    cursor,
    chunkNumber,
    verticalColumns
  });

/**
 * @description 노션 테이블 데이터 가져오기
 */
const queryCollection = async ({
  collectionId,
  collectionViewId,
  loader = {
    limit: 70,
    loadContentCover: true,
    type: "table",
    userLocale: "en",
    userTimeZone: "Asia/Seoul"
  },
  query = {
    aggregate: [
      {
        aggregation_type: "count",
        id: "count",
        property: "title",
        type: "title",
        view_type: "table"
      }
    ],
    filter: [],
    filter_operator: "and",
    sort: []
  }
}: QCRequestBody) =>
  await mapToNotionAPI(NotionAPIEnum.QUERY_COLLECTION, {
    collectionId,
    collectionViewId,
    loader,
    query
  });

const parseNotionPage = (pageUrl: string) => {
  try {
    const pageId = getPageIDFromUrl(pageUrl);
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
          const collectionView: NotionQueryCollection = await queryCollection({
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
              block.value.properties.title.reduce(
                (prev, curr) => prev + curr,
                ""
              )
            );
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export {
  loadPageChunk,
  mapToNotionAPI,
  getPageIDFromUrl,
  setNotionPageID,
  queryCollection,
  parseNotionPage
};
