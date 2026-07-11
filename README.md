# Piccc AI Skill

[![皮可AI，让创意一键成型](assets/piccc-ai-banner.png)](https://picccai.cn)

让 Codex、OpenClaw 和其他兼容 Agent Skills 的智能体调用皮可AI（Piccc AI），生成图片、视频和音频，并自动等待、下载生成结果。

## 快速安装

把下面这句话发给 Agent：

```text
安装技能 https://github.com/xiaoyaocz/piccc-ai-skills
```

也可以使用 Skills CLI：

```bash
npx skills add xiaoyaocz/piccc-ai-skills
```

安装程序会识别仓库中的 `piccc-ai` 技能，并让你选择 Codex、OpenClaw 或其他已支持的 Agent。

## 连接皮可AI账号

安装后告诉 Agent：

```text
连接我的皮可AI账号
```

Agent 会生成一个授权链接。打开链接，登录皮可AI并确认授权即可；API Key 会自动创建并保存在本机，不需要复制密钥或配置环境变量。

## 使用

安装后直接告诉 Agent 你要生成什么，例如：

```text
用皮可AI生成一张 16:9 的电影感雪山日出图，完成后下载到 output/sunrise。
```

```text
用皮可AI把这段产品介绍生成中文旁白，先列出可用音色让我选择。
```

```text
查询皮可AI任务 task_xxx，完成后把结果下载到 output/piccc。
```

技能会先读取后台当前可用的模型和参数，不会固定模型名称。未指定规格时默认优先选择更优惠的模型和低分辨率、低质量配置；使用特价模型前会提示生成可能较慢、不稳定。

查看当前授权状态：

```bash
node scripts/piccc.mjs auth status
```

取消本机授权：

```bash
node scripts/piccc.mjs auth logout
```

## 手动安装

下载仓库后，把根目录中的 `SKILL.md`、`agents`、`references` 和 `scripts` 复制到对应的 `piccc-ai` 目录：

| Agent | 当前项目 | 全局使用 |
| --- | --- | --- |
| Codex | `.agents/skills/piccc-ai` | `~/.codex/skills/piccc-ai` |
| OpenClaw | `<workspace>/skills/piccc-ai` | `~/.openclaw/skills/piccc-ai` |

OpenClaw 也可以直接安装本地目录：

```bash
openclaw skills install ./piccc-ai-skills
```

脚本需要 Node.js 20 或更高版本，不需要安装 npm 依赖。

## 本地检查

```bash
npm run check
```

查看脚本支持的命令：

```bash
node scripts/piccc.mjs --help
```
