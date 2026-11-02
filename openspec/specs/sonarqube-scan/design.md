## Context

需求见同目录 `spec.md`。`.github/workflows/sonarqube.yml` 监听 `workflow_dispatch` 和推送到 `master`，job 使用 `runs-on: self-hosted`，并在步骤里对宿主机 Docker 执行 `docker run`。`.github/workflows/tests.yml` 的 `pull_request` 使用 `ubuntu-latest`。

`pull_request` 会采用 PR 合并结果里的 workflow 文件。Fork 作者可以删掉 job 上的 `if`，或把 `runs-on` 留在 `self-hosted` 并换掉步骤。因此限制条件写在触发器上。

## Goals / Non-Goals

**Goals:**

- 这份 self-hosted workflow 不因 pull request 启动。
- 推送到 `master` 和 `workflow_dispatch` 仍走现有 runner 与现有扫描步骤。

**Non-Goals:**

- 不把 Sonar 扫描改到 GitHub 托管 runner，也不为 pull request 另建一份扫描 workflow。
- 不改 `tests.yml` 的触发器、runner 或测试步骤。
- 不在本仓库轮换 `SONAR_TOKEN`，也不登录 runner 主机做取证。

## Decisions

1. **`sonarqube.yml` 不包含 `pull_request` 触发器。**
   - 保留 `workflow_dispatch` 与 `push.branches: [ master ]`。`runs-on: self-hosted` 和扫描步骤保持原样。
   - **理由**：触发器来自默认分支上的 workflow。PR 替换文件内容时，如果事件本身不再匹配，GitHub 不会用 PR 里的版本在 self-hosted runner 上启动这个 job。
   - **备选**：job 级 `if: github.event.pull_request.head.repo.full_name == github.repository`。不采用：同一份 PR 可以删掉这个 `if`。同仓库 PR 仍会在 self-hosted runner 上执行 PR 分支里的步骤，规格要求这两种 pull request 都不调度。

2. **`tests.yml` 保持 `pull_request` 与 `ubuntu-latest`。**
   - **理由**：pull request 的自动检查已经在 GitHub 托管 runner 上。收紧范围只覆盖 Sonar workflow。

## Risks / Trade-offs

- [Risk] Pull request 合并前不再有 Sonar 结果。→ Mitigation：合并进 `master` 后仍扫描。Node 测试继续覆盖 pull request。
- [Risk] 已经在 runner 上的植入不因改 workflow 消失。→ Mitigation：发布后由运维轮换 `SONAR_TOKEN` 并检查该主机。

## Migration Plan

合并到 `master` 后，新的 `pull_request` 不再触发这份 workflow。回滚时恢复 `pull_request` 触发器。发布后运维轮换 `SONAR_TOKEN`，并检查 self-hosted runner 上的残留容器与植入。

## Open Questions

无。
