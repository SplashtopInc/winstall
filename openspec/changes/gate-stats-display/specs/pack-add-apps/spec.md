## MODIFIED Requirements

### Requirement: 加入选择卡对齐货架皮且不并入目录卡

弹窗应用网格 MUST 使用独立的加入选择卡，MUST NOT 把目录列表卡的全局勾选集用于加入 pack。卡片 MUST 展示与 compact 目录卡一致的身份区（图标、名称、发行商）和最多两行描述。当统计展示开关打开时，卡片 MUST 再展示只读终身 views、downloads、likes。开关关闭时，卡片 MUST NOT 展示这三项或计数行。点击未加入 pack 的卡片 MUST 在弹窗本地选择集中切换选中。已在当前 pack 中的应用 MUST 标明已加入且 MUST NOT 再被选中。底部选择条 MUST 仍将本地选中项一次性加入 pack。切分类或搜索 MUST NOT 丢弃尚未加入的本地选中项。

#### Scenario: 已加入不可再选

- **WHEN** 某应用已在当前 pack 中且出现在弹窗网格
- **THEN** 该卡标明已加入，激活它 MUST NOT 把它加入弹窗选择集

#### Scenario: 切分类保留未提交选择

- **WHEN** 用户选中若干尚未加入 pack 的应用后切换分类
- **THEN** 底部选择条仍显示这些选中项

#### Scenario: 开关关闭时选择卡不展示计数

- **WHEN** 统计展示开关关闭，且用户打开 Add Apps 弹窗
- **THEN** 选择卡 MUST NOT 展示 views、downloads、likes
