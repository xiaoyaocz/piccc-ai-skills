import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const script = 'skills/piccc-ai/scripts/piccc.mjs'
let server
let baseUrl
const requests = []

test.before(async () => {
  server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : null
    requests.push({ method: request.method, url: request.url, body, authorization: request.headers.authorization })
    response.setHeader('Content-Type', 'application/json')

    if (request.url === '/v1/images/models') return response.end(JSON.stringify({ object: 'list', data: [{ id: 'image-model' }] }))
    if (request.url === '/v1/videos/models') return response.end(JSON.stringify({ object: 'list', data: [{ id: 'video-model' }] }))
    if (request.url === '/v1/audio/models') return response.end(JSON.stringify({ object: 'list', data: [{ id: 'audio-model', voice_presets: [{ id: 'voice-1', name: '中文女声' }] }] }))
    if (request.url === '/v1/images/tasks') return response.end(JSON.stringify({ task_id: 'task-image', status: 'queued' }))
    if (request.url === '/v1/videos/tasks') return response.end(JSON.stringify({ task_id: 'task-video', status: 'queued' }))
    if (request.url === '/v1/audio/tasks') return response.end(JSON.stringify({ task_id: 'task-audio', status: 'queued' }))
    if (request.url === '/v1/tasks/task-image') return response.end(JSON.stringify({ task_id: 'task-image', type: 'image', status: 'completed', progress: 100, outputs: [{ url: `${baseUrl}/files/image.png`, mime_type: 'image/png' }] }))
    if (request.url === '/v1/tasks/task-audio') return response.end(JSON.stringify({ task_id: 'task-audio', type: 'audio', status: 'completed', progress: 100, actual_cost: 7, outputs: [] }))
    if (request.url?.startsWith('/v1/tasks?')) return response.end(JSON.stringify({ items: [{ task_id: 'task-image', type: 'image', status: 'completed' }], page: 1, page_size: 20 }))
    if (request.url === '/files/image.png') {
      response.setHeader('Content-Type', 'image/png')
      return response.end(Buffer.from('fake-png'))
    }
    response.statusCode = 404
    response.end(JSON.stringify({ error: { code: 'not_found' } }))
  })
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})

test.after(async () => {
  await new Promise((resolveClose) => server.close(resolveClose))
})

test('one skill lists image, video, and audio models', async () => {
  const image = await run(['models', 'image'])
  const video = await run(['models', 'video'])
  const audio = await run(['models', 'audio'])
  assert.equal(image.data[0].id, 'image-model')
  assert.equal(video.data[0].id, 'video-model')
  assert.equal(audio.data[0].id, 'audio-model')
  assert.ok(requests.slice(-3).every((item) => item.authorization === 'Bearer test-key'))
})

test('voice search returns live voice IDs', async () => {
  const result = await run(['voices', '--model', 'audio-model', '--search', '中文'])
  assert.equal(result.data[0].id, 'voice-1')
})

test('image generation waits and downloads output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'piccc-skills-'))
  try {
    const result = await run(['generate', 'image', '--model', 'image-model', '--prompt', 'a red kite', '--wait', '--output-dir', directory, '--interval', '10'])
    assert.equal(result.status, 'completed')
    assert.equal((await readFile(result.downloads[0], 'utf8')), 'fake-png')
    const submitted = requests.findLast((item) => item.url === '/v1/images/tasks')
    assert.equal(submitted.body.prompt, 'a red kite')
    assert.equal(submitted.body.model, 'image-model')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('video generation maps shared CLI options', async () => {
  const result = await run(['generate', 'video', '--model', 'video-model', '--prompt', 'ocean sunset', '--duration', '5', '--aspect-ratio', '16:9'])
  assert.equal(result.task_id, 'task-video')
  const submitted = requests.findLast((item) => item.url === '/v1/videos/tasks')
  assert.equal(submitted.body.duration_seconds, 5)
  assert.equal(submitted.body.aspect_ratio, '16:9')
})

test('audio generation marks the initial charge as a precharge', async () => {
  const result = await run(['generate', 'audio', '--model', 'audio-model', '--prompt', 'hello'])
  assert.equal(result.billing.precharge_credits, 10)
  assert.equal(result.billing.final_cost_available_after_completion, true)
})

test('task commands query and filter existing tasks', async () => {
  const task = await run(['task', 'get', 'task-audio'])
  const list = await run(['tasks', '--type', 'image', '--status', 'completed'])
  assert.equal(task.actual_cost, 7)
  assert.equal(list.items[0].task_id, 'task-image')
  const request = requests.findLast((item) => item.url?.startsWith('/v1/tasks?'))
  assert.match(request.url, /type=image/)
  assert.match(request.url, /status=completed/)
})

test('missing API key points to the Piccc AI account page', async () => {
  const result = await runRaw(['models', 'image'], { PICCC_API_KEY: '', PICCC_API_BASE_URL: baseUrl })
  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /https:\/\/picccai\.cn\/account\?tab=apiKeys/)
})

test('help works without an API key', async () => {
  const result = await runRaw(['--help'], { PICCC_API_KEY: '', PICCC_API_BASE_URL: '' })
  assert.equal(result.code, 0)
  assert.match(result.stdout, /Piccc AI media task CLI/)
  assert.match(result.stdout, /PICCC_API_KEY/)
})

test('unknown generation options fail before creating a paid task', async () => {
  const requestCount = requests.length
  const result = await runRaw(['generate', 'image', '--model', 'image-model', '--prompt', 'test', '--resoluton', '1K'])
  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /Unknown option: --resoluton/)
  assert.equal(requests.length, requestCount)
})

test('output directory requires waiting for the task', async () => {
  const result = await runRaw(['generate', 'image', '--model', 'image-model', '--prompt', 'test', '--output-dir', 'output'])
  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /--output-dir requires --wait/)
})

function run(args) {
  return runRaw(args).then((result) => {
    if (result.code !== 0) throw new Error(`${script} exited ${result.code}: ${result.stderr}`)
    try { return JSON.parse(result.stdout) } catch (error) { throw new Error(`Invalid JSON from ${script}: ${result.stdout}\n${result.stderr}`, { cause: error }) }
  })
}

function runRaw(args, env = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [resolve(root, script), ...args], {
      env: { ...process.env, PICCC_API_KEY: 'test-key', PICCC_API_BASE_URL: baseUrl, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', rejectRun)
    child.on('close', (code) => resolveRun({ code, stdout, stderr }))
  })
}
