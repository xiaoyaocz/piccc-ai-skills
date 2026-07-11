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

## 创建 API Key

前往[皮可AI个人中心](https://picccai.cn/account?tab=apiKeys)，登录后打开“API Key”，创建并立即保存密钥。完整密钥只显示一次。

首次使用前，把密钥保存到 `PICCC_API_KEY` 环境变量或 Agent 的密钥管理中。不要把密钥发到对话里，也不要提交到仓库。

macOS 或 Linux：

```bash
export PICCC_API_KEY="你的 API Key"
```

PowerShell：

```powershell
$env:PICCC_API_KEY = "你的 API Key"
```

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

技能会先读取后台当前可用的模型和参数，不会固定模型名称。

## 手动安装

下载仓库后，将整个 [`skills/piccc-ai`](skills/piccc-ai) 目录复制到对应位置：

| Agent | 当前项目 | 全局使用 |
| --- | --- | --- |
| Codex | `.agents/skills/piccc-ai` | `~/.codex/skills/piccc-ai` |
| OpenClaw | `<workspace>/skills/piccc-ai` | `~/.openclaw/skills/piccc-ai` |

OpenClaw 也可以直接安装本地目录：

```bash
openclaw skills install ./piccc-ai-skills/skills/piccc-ai
```

脚本需要 Node.js 20 或更高版本，不需要安装 npm 依赖。

## 本地检查

```bash
npm run check
```

查看脚本支持的命令：

```bash
node skills/piccc-ai/scripts/piccc.mjs --help
```
