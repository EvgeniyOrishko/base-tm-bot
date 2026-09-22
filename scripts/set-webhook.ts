#!/usr/bin/env tsx

// One-off script: registers the Telegram webhook for a deployed instance.
// Run locally after each deploy (or domain change) with the webhook env vars set:
//   BOT_MODE=webhook BOT_TOKEN=... BOT_WEBHOOK=https://<app>.vercel.app/api/webhook \
//   BOT_WEBHOOK_SECRET=... npx tsx scripts/set-webhook.ts
import process from 'node:process'
import { config } from '#root/config.js'

if (!config.isWebhookMode) {
  console.error('BOT_MODE must be "webhook" to set a webhook')
  process.exit(1)
}

const url = `https://api.telegram.org/bot${config.botToken}/setWebhook`
const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    url: config.botWebhook,
    secret_token: config.botWebhookSecret,
    allowed_updates: config.botAllowedUpdates,
  }),
})

const result = await response.json()
console.log(result)

if (!result.ok) {
  process.exit(1)
}
