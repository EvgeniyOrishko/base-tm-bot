import type { Context } from '#root/bot/context.js'
import { startOnboardingData } from '#root/bot/callback-data/onboarding.js'
import { InlineKeyboard } from 'grammy'

export function createStartKeyboard(ctx: Context) {
  return new InlineKeyboard().text(
    ctx.t('onboarding-start-button'),
    startOnboardingData.pack({ action: 'start' }),
  )
}

export function createJoinGroupKeyboard(ctx: Context, inviteLink: string) {
  return new InlineKeyboard().url(ctx.t('onboarding-join-button'), inviteLink)
}
