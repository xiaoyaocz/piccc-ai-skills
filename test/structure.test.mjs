import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const skillsRoot = resolve(root, 'skills')

test('repository exposes one self-contained skill', async () => {
  const entries = await readdir(skillsRoot, { withFileTypes: true })
  const skillDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  assert.deepEqual(skillDirectories, ['piccc-ai'])

  const skillFile = resolve(skillsRoot, 'piccc-ai', 'SKILL.md')
  const source = await readFile(skillFile, 'utf8')
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)
  assert.ok(frontmatter, 'SKILL.md must start with YAML frontmatter')
  assert.match(frontmatter[1], /^name: piccc-ai$/m)
  assert.match(frontmatter[1], /^description: .+$/m)

  const keys = [...frontmatter[1].matchAll(/^([a-z][a-z0-9_-]*):/gm)].map((match) => match[1])
  assert.deepEqual(keys, ['name', 'description'])
})

test('SKILL.md local links resolve inside the skill', async () => {
  const skillFile = resolve(skillsRoot, 'piccc-ai', 'SKILL.md')
  const source = await readFile(skillFile, 'utf8')
  const links = [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1])
  const localLinks = links.filter((link) => !/^[a-z]+:/i.test(link) && !link.startsWith('#'))
  assert.ok(localLinks.length > 0)
  for (const link of localLinks) await access(resolve(dirname(skillFile), link))
})

test('Codex metadata names the skill in its default prompt', async () => {
  const source = await readFile(resolve(skillsRoot, 'piccc-ai', 'agents', 'openai.yaml'), 'utf8')
  assert.match(source, /default_prompt: "[^"]*\$piccc-ai[^"]*"/)
})
