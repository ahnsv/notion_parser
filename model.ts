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
