# Piccc AI 媒体接口

## 连接账号

首次使用时运行：

```bash
node scripts/piccc.mjs auth login
```

打开命令显示的链接，登录皮可AI并确认授权。脚本会自动创建并保存 API Key，不要让用户在对话中发送密钥。

## 模型接口

| 类型 | 接口 | 主要能力字段 |
| --- | --- | --- |
| 图片 | `GET /v1/images/models` | 比例、分辨率、质量、生成数量 |
| 视频 | `GET /v1/videos/models` | 分辨率、比例、时长、生成模式、参考模式 |
| 音频 | `GET /v1/audio/models` | 格式、采样率、参数范围、参考模式、音色 |

每次创建任务前使用模型响应中的 `data[].id`。音色使用 `voice_presets[].id`，不要传显示名称。

## 创建任务

图片：`POST /v1/images/tasks`

- 必填：`model`、`prompt`
- 可选：`aspect_ratio`、`resolution`、`quality`、`n`、`web_search`、`external_id`

视频：`POST /v1/videos/tasks`

- 必填：`model`、`prompt`
- 可选：`route_mode`、`reference_mode`、`resolution`、`aspect_ratio`、`duration_seconds`、`audio`、`web_search`、`external_id`

音频：`POST /v1/audio/tasks`

- 必填：`model`、`prompt`
- 可选：`output_format`、`sample_rate`、`speech_rate`、`loudness_rate`、`pitch_rate`、`reference_mode`、`voice_id`、`audio_references`、`image_references`、`external_id`
- `reference_mode=audio` 时传 `voice_id` 或 `audio_references`
- `reference_mode=image` 时传 `image_references`
- 提交时预扣 10 积分，完成后的 `actual_cost` 是最终费用

## 查询任务

- `GET /v1/tasks/{task_id}`：查询单个图片、视频或音频任务。
- `GET /v1/tasks`：分页查询任务，可按 `type` 和 `status` 过滤。

任务状态包括 `queued`、`running`、`completed`、`failed`、`cancelled`。只有 `completed` 状态下的 `outputs[].url` 才是最终结果。
