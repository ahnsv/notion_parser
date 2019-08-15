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
  loader?: {
    limit: number;
    loadContentCover: boolean;
    type: string;
    userLocale: string;
    userTimeZone: string;
  };
  query?: {
    aggregate: {
      aggregation_type: string;
      id: string;
      property: string;
      type: string;
      view_type: string;
    }[];
    filter: any[];
    filter_operator: string;
    sort: any[];
  };
}

export interface NotionBlock {
  role: string;
  value: {
    alive: boolean;
    collection_id?: string;
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
    view_ids: string[];
  };
}

export interface NotionCollection {
  role: string;
  value: {
    alive: boolean;
    collection_page_properties: {
      property: string;
      visible: boolean;
    };
    id: string;
    name: string[];
    parent_id: string;
    parent_table: string;
    schema: {
      name: string;
      options?: { color: string; id: string; value: string }[];
      type: string;
    };
    version: number;
  };
}

export interface NoitionQueryCollection {
  recordMap: {
    block: {
      [hash: string]: NotionBlock;
    };
    collection: {
      [hash: string]: NotionCollection;
    };
    collection_view: {
      // do we need this 22222
    };
  };
}
