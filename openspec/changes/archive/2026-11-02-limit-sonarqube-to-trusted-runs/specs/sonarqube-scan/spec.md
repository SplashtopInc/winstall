## Purpose

在代码进入 master 或有人手动触发时，用项目现有的自托管 runner 做 SonarQube 扫描。Pull request 不得在这台 runner 上启动该扫描。

## ADDED Requirements

### Requirement: Sonar 扫描不响应 pull request

SonarQube workflow MUST NOT 因 `pull_request` 启动，包括 fork 与同仓库的 pull request。该 workflow MUST 在推送到 `master` 时启动，也 MUST 支持 `workflow_dispatch`。这两类运行 MUST 继续使用现有 self-hosted runner。扫描步骤与 Sonar 参数 MUST 保持现有行为。

#### Scenario: Fork 的 pull request 不调度扫描

- **WHEN** 外部贡献者从 fork 打开一个会修改 workflow 的 pull request
- **THEN** self-hosted runner 上 MUST NOT 出现该 SonarQube job

#### Scenario: 同仓库 pull request 不调度扫描

- **WHEN** 具备写权限的人在本仓库打开 pull request
- **THEN** self-hosted runner 上 MUST NOT 出现该 SonarQube job

#### Scenario: 推送到 master 仍扫描

- **WHEN** 代码被推送到 `master`
- **THEN** SonarQube job MUST 在现有 self-hosted runner 上运行

#### Scenario: 手动触发仍扫描

- **WHEN** 具备触发权限的人手动运行该 workflow
- **THEN** SonarQube job MUST 在现有 self-hosted runner 上运行

### Requirement: Pull request 测试留在 GitHub 托管 runner

现有 Node 测试 workflow MUST 继续响应 `pull_request`，并且 MUST 使用 GitHub 托管 runner。本 change MUST NOT 把该测试 job 改到 self-hosted runner，也 MUST NOT 新增一份在 self-hosted runner 上响应 pull request 的 Sonar workflow。

#### Scenario: Pull request 仍跑测试

- **WHEN** 有人打开 pull request
- **THEN** Node 测试 job MUST 在 GitHub 托管 runner 上运行
