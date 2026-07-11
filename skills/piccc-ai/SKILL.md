---
name: piccc-ai
description: Generate images, videos, and audio with Piccc AI (皮可AI), or query and download existing media tasks. Use when the user asks to create visual or audio media with Piccc AI, discover its current models or voices, check an asynchronous task, or download completed results. Do not use for editing existing local media.
---

# Piccc AI

Use `{baseDir}/scripts/piccc.mjs` for every Piccc AI request. `{baseDir}` is the directory containing this file.

## Before the first request

Check `PICCC_API_KEY`. If it is unavailable, direct the user to [皮可AI个人中心](https://picccai.cn/account?tab=apiKeys). Tell them to sign in, open “API Key,” create a key, and save it immediately because the complete key is shown only once. Never ask the user to paste the key into chat; have them store it in the Agent's environment or secret manager.

## Workflow

1. Query the relevant live model list before creating a task. Reuse a supplied model ID only when it came from a current response.
2. Select only values advertised by that model. Never invent model IDs, voice IDs, formats, ratios, resolutions, modes, or durations.
3. Put long or multiline prompts in a UTF-8 file and use `--prompt-file`.
4. When the user expects a finished file, use `--wait --output-dir DIR` in the initial request. Do not create another task while waiting.
5. On timeout, return the task ID and latest status so the same task can be resumed. Treat `completed`, `failed`, and `cancelled` as terminal.
6. For audio, call the initial 10 credits a precharge and use `actual_cost` from the completed task as the final cost.

## Commands

```bash
node {baseDir}/scripts/piccc.mjs models image
node {baseDir}/scripts/piccc.mjs models video
node {baseDir}/scripts/piccc.mjs models audio
node {baseDir}/scripts/piccc.mjs voices --model MODEL_ID --search Chinese

node {baseDir}/scripts/piccc.mjs generate image --model MODEL_ID --prompt-file PROMPT.txt --wait --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs generate video --model MODEL_ID --prompt-file PROMPT.txt --wait --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs generate audio --model MODEL_ID --prompt-file SCRIPT.txt --wait --output-dir OUTPUT_DIR

node {baseDir}/scripts/piccc.mjs task get TASK_ID
node {baseDir}/scripts/piccc.mjs task wait TASK_ID --output-dir OUTPUT_DIR
node {baseDir}/scripts/piccc.mjs tasks --type image --status completed --page 1 --page-size 20
node {baseDir}/scripts/piccc.mjs --help
```

Read [references/api.md](references/api.md) when selecting generation parameters or handling task responses.

## Guardrails

- Ask for clarification only when a missing creative choice would materially change the result.
- Never claim success before status is `completed` and at least one output URL exists.
- Never expose the API Key in command arguments, prompts, logs, or files.
- Do not create a replacement task while checking status; task reads must not trigger new charges.
- Preserve the API response when reporting parameter, content-policy, billing, or upstream failures.
