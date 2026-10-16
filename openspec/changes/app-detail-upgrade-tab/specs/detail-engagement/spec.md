## MODIFIED Requirements

### Requirement: App download counts include pack and generate exports

一个 App 的终身 download 计数 MUST 包含该 App 自己的下载（复制详情页安装命令、复制详情页升级命令，或下载详情页 instant installer），加上它所属 Pack 每次导出时的一次，加上它在生成页每次导出时的一次。Pack 导出 MUST 仍把该 Pack 的 download 计数加一。打开安装抽屉但没有复制或下载 MUST NOT 增加计数。对同一个 App，在现有的按 App id 合并的 download 去重窗口内，再次复制安装命令或升级命令 MUST NOT 再发送第二条 app `download` track。

#### Scenario: Pack export increments the pack and each listed app
- **WHEN** 用户复制或下载一个含有若干 App 的 Pack 导出
- **THEN** 系统 MUST 为该 Pack 发送一条 pack `download` track，并为其中每个不同的 App 发送一条 app `download` track

#### Scenario: Generate export increments each listed app
- **WHEN** 用户在生成页复制或下载导出
- **THEN** 系统 MUST 为当前生成清单中每个不同的 App 发送一条 app `download` track，且 MUST NOT 发送 pack `download` track

#### Scenario: App detail installer download increments the app
- **WHEN** 用户在 App 详情页成功下载 instant installer
- **THEN** 系统 MUST 为该 App 发送一条 app `download` track，且 MUST NOT 发送 pack `download` track

#### Scenario: 详情页复制升级命令计入 download
- **WHEN** 用户在 App 详情页复制升级命令，且该 App 当前不在 download 去重窗口内
- **THEN** 系统 MUST 为该 App 发送一条 app `download` track，且 MUST NOT 发送 pack `download` track

#### Scenario: 安装与升级的复制算同一条
- **WHEN** 用户在 App 详情页复制了安装命令，并在该 App 的 download 去重窗口内再复制升级命令
- **THEN** 系统 MUST NOT 为第二次复制再发送一条 app `download` track
