
## 技术栈

- 语言与模块: JavaScript (应用与组件以 ESM 为主，部分服务端与脚本混用 CommonJS)
- 运行时: Node.js 22
- 框架: Next.js
- 包管理器: npm
- 测试框架: Node.js 原生测试框架

## 项目规范

所有开发工作必须遵循以下规范文档，如果无法读取规范文档，请明确告知用户，不要自行假设规范内容:

- 需求规范: openspec/specs/**/spec.md
- 架构设计: openspec/specs/**/design.md

## 关键约定

- **命名规范**: 文件名、变量和函数名使用 `lowerCamelCase`，常量使用 `UPPER_SNAKE_CASE`，API 路由使用 `kebab-case` 小写复数形式（如 `/apps/trending`），手册与指南文档使用 `kebab-case`。
- **语言规范**: 文档、需求设计、任务规划与语义解释使用中文书写；代码注释使用英文。
