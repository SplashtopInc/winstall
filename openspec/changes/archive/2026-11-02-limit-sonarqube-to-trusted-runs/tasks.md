## 1. Sonar workflow

- [x] 1.1 从 `.github/workflows/sonarqube.yml` 删除 `pull_request` 触发器，只保留 `workflow_dispatch` 和推送到 `master`
- [x] 1.2 确认该 job 仍是 `runs-on: self-hosted`，扫描步骤、Docker 调用和 Sonar 参数保持原样

## 2. Pull request 测试

- [x] 2.1 确认 `.github/workflows/tests.yml` 仍响应 `pull_request` 且 `runs-on` 为 `ubuntu-latest`，并且仓库里没有新增在 self-hosted runner 上响应 pull request 的 Sonar workflow
