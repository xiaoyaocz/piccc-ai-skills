---
name: piccc-ai
description: Generate images, videos, and audio with Piccc AI (皮可AI), or query and download existing media tasks. Use when the user asks to create visual or audio media with Piccc AI, discover its current models or voices, check an asynchronous task, or download completed results. Do not use for editing existing local media.
---

# Piccc AI

Use `{baseDir}/scripts/piccc.mjs` for every Piccc AI request. `{baseDir}` is the directory containing this file.

## Before the first request

Run `node {baseDir}/scripts/piccc.mjs auth status`. If it reports `authenticated: false`, run `node {baseDir}/scripts/piccc.mjs auth login` and wait for the command to finish. The command opens the authorization page, receives the local browser callback, and saves the API Key automatically. Do not ask the user to report that authorization is complete. If the browser cannot be opened, give the user the displayed link and code while the command continues waiting. Never ask the user to create, copy, or paste an API Key.

## Workflow

1. Unless the user names a model or asks for higher quality, run `models TYPE --economy` and use its selected model and defaults. Prefer lower cost over speed or quality.
2. Let explicit user requirements override economy defaults. Otherwise use one output, the lowest supported resolution and quality, the shortest supported video duration, no audio or web search, and the lowest supported audio sample rate.
3. If `special_offer` is true or the selected model name or description says `特价`, `折扣`, `special offer`, `discount`, or `promo`, tell the user before submission: “特价模型可能生成较慢、稳定性较差。”
4. Select only values advertised by the live model response. Never invent model IDs, voice IDs, formats, ratios, resolutions, modes, or durations.
5. Put long or multiline prompts in a UTF-8 file and use `--prompt-file`.
6. When the user expects a finished file, use `--wait --output-dir DIR` in the initial request. Do not create another task while waiting.
7. On timeout, return the task ID and latest status so the same task can be resumed. Treat `completed`, `failed`, and `cancelled` as terminal.
8. For audio, call the initial 10 credits a precharge and use `actual_cost` from the completed task as the final cost.

## Commands

```bash
node {baseDir}/scripts/piccc.mjs models image
node {baseDir}/scripts/piccc.mjs models video
node {baseDir}/scripts/piccc.mjs models audio
node {baseDir}/scripts/piccc.mjs models image --economy
node {baseDir}/scripts/piccc.mjs voices --model MODEL_ID --search Chinese

node {baseDir}/scripts/piccc.mjs generate image --model MODEL_ID --prompt-file PROMPT.txt --wait --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs generate video --model MODEL_ID --prompt-file PROMPT.txt --wait --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs generate audio --model MODEL_ID --prompt-file SCRIPT.txt --wait --output-dir OUTPUT_DIR

node {baseDir}/scripts/piccc.mjs task get TASK_ID
node {baseDir}/scripts/piccc.mjs task wait TASK_ID --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs tasks --type image --status completed --page 1 --page-size 20
node {baseDir}/scripts/piccc.mjs auth login
node {baseDir}/scripts/piccc.mjs auth login --no-browser
node {baseDir}/scripts/piccc.mjs auth status
node {baseDir}/scripts/piccc.mjs auth logout
node {baseDir}/scripts/piccc.mjs --help
```

Read [references/api.md](references/api.md) when selecting generation parameters or handling task responses.

## Guardrails

- Ask for clarification only when a missing creative choice would materially change the result.
- Do not raise resolution, quality, duration, output count, audio, or web search above the economy defaults unless the user requests it or the task requires it.
- Always surface the special-offer reliability warning before creating a paid task; a script warning is only a backup and does not replace telling the user.
- Never claim success before status is `completed` and at least one output URL exists.
- Never expose the API Key in command arguments, prompts, logs, or project files. Let the script manage its private credentials file.
- Always use the authorization command for first-time setup; do not teach environment-variable setup unless the user explicitly requests it.
- Do not create a replacement task while checking status; task reads must not trigger new charges.
- Preserve the API response when reporting parameter, content-policy, billing, or upstream failures.
