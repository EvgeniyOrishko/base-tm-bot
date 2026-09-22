import type { Context } from '#root/bot/context.js'
import { isAdmin } from '#root/bot/filters/is-admin.js'
import { setCommandsHandler } from '#root/bot/handlers/commands/setcommands.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer } from 'grammy'

const composer = new Composer<Context>()

const feature = composer
  .chatType('private')
  .filter(isAdmin)

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
)

// Send a video to the bot to get its file_id for the WELCOME_VIDEO env variable
feature.on(':video', logHandle('admin-video-file-id'), (ctx) => {
  return ctx.reply(`<code>${ctx.msg.video.file_id}</code>`)
})

export { composer as adminFeature }
