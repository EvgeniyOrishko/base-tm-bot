import type { WebhookConfig } from '#root/config.js'
import { createBot } from '#root/bot/index.js'
import { config } from '#root/config.js'
import { logger } from '#root/logger.js'
import { webhookCallback } from 'grammy'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

if (!config.isWebhookMode) {
  throw new Error('BOT_MODE must be "webhook" when deploying to Vercel')
}

const webhookConfig: WebhookConfig = config

const bot = createBot(webhookConfig.botToken, { config: webhookConfig, logger })

// Vercel serverless functions are stateless — there is no long-lived process
// to call bot.init() on startup. It's cheap (a single, grammY-cached getMe
// call) and safe to await on every invocation.
let initialized: Promise<void> | undefined

// This file is served at /api/webhook by Vercel (file-based routing), so
// BOT_WEBHOOK must be set to https://<your-domain>/api/webhook — no rewrite
// or vercel.json entry needed.
const app = new Hono().post('/api/webhook', async (c) => {
  initialized ??= bot.init()
  await initialized

  return webhookCallback(bot, 'hono', {
    secretToken: webhookConfig.botWebhookSecret,
  })(c)
})

app.get('/api/webhook', c => c.json({ status: true }))

export const GET = handle(app)
export const POST = handle(app)
