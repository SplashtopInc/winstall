## Why

`.github/workflows/sonarqube.yml` 在任意分支的 `pull_request` 上使用 `self-hosted`，并且该 job 会调用宿主机 Docker。Fork 的 pull request 会执行 PR 里的 workflow 文件，外部贡献者因此可以在这台长期存在的 runner 上运行自己的命令，并在之后的 `master` 运行里读到 `SONAR_TOKEN`。

## What Changes

- SonarQube workflow 只在推送到 `master` 和 `workflow_dispatch` 时运行，并且仍使用现有 self-hosted runner。
- 该 workflow 不再包含 `pull_request` 触发。Fork PR 与同仓库 PR 都不会在这台 runner 上启动 Sonar job。
- `.github/workflows/tests.yml` 继续在 `ubuntu-latest` 上覆盖 pull request。本 change 不新增一份给 PR 用的 Sonar workflow。
- 扫描步骤、Docker 调用方式和 Sonar 参数保持不变。

## Capabilities

### New Capabilities

- `sonarqube-scan`：自托管 SonarQube 扫描只接受已进入 `master` 的代码和具备手动触发权限的运行，不接受 pull request。

### Modified Capabilities

- （无）

## Impact

- CI：`.github/workflows/sonarqube.yml` 的触发器。Pull request 不再产生 Sonar 扫描和对应 artifact。
- `tests.yml`、应用代码、公开 URL 和 Sonar 服务器配置不变。
- 发布后由运维轮换 `SONAR_TOKEN`，并检查这台 self-hosted runner 上是否有残留容器或植入。这两步不在本仓库的代码改动里。
