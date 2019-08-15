import { parseNotionPage } from "./api";

/**
 * Testing part
 */
const vscodeDebugTestPage =
  "https://www.notion.so/taebae/cms-a7c23632abfa4682b3ecb62a39787655";
const { npm_config_testPage, npm_package_config_testPage } = process.env;
parseNotionPage(
  (npm_config_testPage as string) ||
    vscodeDebugTestPage ||
    (npm_package_config_testPage as string)
);
