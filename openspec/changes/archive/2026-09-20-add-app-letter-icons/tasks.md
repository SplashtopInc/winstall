## 1. 字母与配色

- [x] 1.1 新增 `utils/appLetterIcon.js`：`getAppLetter({ name, id })` 取单字（名优先，再 `_id` 最后一段），跳过空白与 `.` `-` `+`，拉丁大写、CJK 原样
- [x] 1.2 `getAppLetterBackground(id)` 用短色板对 `_id` 稳定哈希；无 id 用固定中性色，避开包装盒粉紫
- [x] 1.3 新增 `test/appLetterIcon.test.js`：覆盖 `Visual Studio Code`→`V`、`7-Zip`→`7`、`微信`→`微`、`Publisher.AppName` 回退、抽不出字、同一 id 底色稳定

## 2. AppIcon 接入

- [x] 2.1 在 `components/AppIcon.js` 用去空白后的空 `icon` 替换 generic 分支为字母块；本地精选 / override / 成对 URL 优先；抽不出字仍 `GenericAppIcon`
- [x] 2.2 `ExternalAppIcon` 与 `AppPicture` 的 `onError` 保持包装盒，不改字母
- [x] 2.3 字母块方形、25 基准、铺满父槽、`aria-hidden`；新增 `styles/appIcon.module.scss`（或等价），不使用圆形头像

## 3. 合集预览

- [x] 3.1 `components/PackPreview.js` 不再按空 `icon` 过滤，传入 `name`，保留既有数量上限
