# ⭐️Notion page parser

Notion 페이지를 파싱해서 날려줘요. (간단 🙊)

> Disclaimer: 아직 커맨드라인에서 프린트아웃밖에 안됩니다...ㅠ

> Disclaimer2: 노션 api가 아직 뒤죽박죽이라 코드가 유해할수 있습니다...

## TEST

```bash
# 기본 테스트 페이지로 파싱
npm run test
# 커스텀 테스트 페이지로 파싱
npm run test --testPage=https:/www.notion.so/{여러분의노션페이지}
```

## Possible usage

- React Hooks 같은 거로 래핑해서 간단하게 사용하기
- 크롬 익스텐션 등으로 만들어서 좀 더 trackable하게 만들기

## hypotheses

- 노션 워크스페이스, 페이지 받아오기 (like notion chrome extension) 가능?
- 노션 mongodb 연동
- 노션 글 content add/update(가능?)
- 노션 로그인 체크 + 로그인

## TODO

- [ ] 노션 페이지/워크스페이스 드롭다운 구현
- [x] 노션 글 URL로 글 정보 받아와서 파싱 (필요한거만)
- [x] 노션 블락 list
