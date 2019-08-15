const fetch = require("node-fetch");
const NOTION_URL = "https://www.notion.so/";
const NOTION_URL_REGEX = new RegExp("https://www.notion.so/");
/**
 * 노션 page ID 포맷에 맞게 파싱
 * @param url
 */
const parseToNotionPageIdFormat = (url: string) =>
  url.length !== 32
    ? new Error("노션 페이지 아이디를 찾을 수 없습니다")
    : `${url.substr(0, 8)}-${url.substr(8, 4)}-${url.substr(
        12,
        4
      )}-${url.substr(16, 4)}-${url.substr(20, 12)}`;
/**
 * @description Notion 페이지 ID store
 */
const tempTargetNotionPageMeta = {
  pageId: "",
  token: ""
};
const setNotionPageID = (pageId: String) => {
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
 * @description types for API
 */
export enum NotionAPIEnum {
  LOAD_PAGE_CHUNK = "loadPageChunk",
  QUERY_COLLECTION = "queryCollection"
}
export interface LPCRequestBody {
  pageId: string;
  limit: number;
  cursor: { stack: any[] };
  chunkNumber: number;
  verticalColumns: boolean;
}
export interface QCRequestBody {
  collectionId: string;
  collectionViewId: string;
  loader: {
    limit: number;
    loadContentCover: string;
    type: string;
    userLocale: string;
    userTimeZone: string;
  };
  query: {
    aggregate: string;
    filter: string;
    filter_operator: string;
    sort: string;
  };
}

export interface NotionBlock {
  role: string;
  value: {
    alive: boolean;
    created_by: string;
    created_time: number;
    id: string;
    last_edited_by: string;
    last_edited_time: string;
    parent_id: string;
    parent_table: string;
    properties: {
      title: any[];
    };
    type: string;
    version: number;
  };
}

/**
 * @description Handling promise responses
 * @license https://github.com/zeit/spr-landing/blob/fed52dccf9e7f39cada283e4c487a2ed9d80ae30/data/notion.js#L110
 * @param res {Response}
 */

async function getError(res: Response) {
  return `Notion API error (${res.status}) \n${await getJSONHeaders(
    res
  )}\n ${await getBodyOrNull(res)}`;
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
    throw new Error(await getError(res));
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
