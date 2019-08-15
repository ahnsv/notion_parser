import {
  NotionAPIEnum,
  LPCRequestBody,
  QCRequestBody,
  NotionBlock
} from "./model";
import { NOTION_URL_REGEX, NOTION_URL } from "./constants";

const fetch = require("node-fetch");
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

export { loadPageChunk, mapToNotionAPI, getPageIDFromUrl, setNotionPageID };
