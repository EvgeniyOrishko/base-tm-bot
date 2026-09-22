import type { Context } from '#root/bot/context.js'
import { startOnboardingData } from '#root/bot/callback-data/onboarding.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { createJoinGroupKeyboard, createStartKeyboard } from '#root/bot/keyboards/onboarding.js'
import { createPersonalInviteLink, isGroupMember } from '#root/bot/services/group-invite.js'
import { Composer } from 'grammy'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Deep link from the website: https://t.me/<bot_username>?start=<source>
feature.command('start', logHandle('command-start'), (ctx) => {
  if (ctx.match)
    ctx.session.source = ctx.match

  ctx.logger.info({ msg: 'User started the bot', user_id: ctx.from.id, source: ctx.match || null })

  return ctx.reply(ctx.t('welcome'), {
    reply_markup: createStartKeyboard(ctx),
  })
})

feature.callbackQuery(
  startOnboardingData.filter({ action: 'start' }),
  logHandle('keyboard-onboarding-start'),
  async (ctx) => {
    await ctx.answerCallbackQuery()
    // Remove the button so the flow isn't triggered twice by double taps
    await ctx.editMessageReplyMarkup().catch(() => {})

    const userId = ctx.from.id

    if (await isGroupMember(ctx, userId)) {
      await ctx.reply(ctx.t('onboarding-already-member'))
    }
    else {
      try {
        const inviteLink = await createPersonalInviteLink(ctx, userId)
        await ctx.reply(ctx.t('onboarding-join-group', {
          hours: Math.round(ctx.config.inviteLinkTtl / 3600),
        }), {
          reply_markup: createJoinGroupKeyboard(ctx, inviteLink),
        })
      }
      catch (error) {
        ctx.logger.error({ msg: 'Failed to create invite link', err: error })
        await ctx.reply(ctx.t('onboarding-invite-failed'))
      }
    }

    ctx.chatAction = 'upload_video'
    return ctx.replyWithVideo(ctx.config.welcomeVideo, {
      caption: ctx.t('onboarding-video-caption'),
      supports_streaming: true,
    })
  },
)

export { composer as welcomeFeature }
