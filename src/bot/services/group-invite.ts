import type { Context } from '#root/bot/context.js'

const MEMBER_STATUSES = new Set(['creator', 'administrator', 'member'])

export async function isGroupMember(ctx: Context, userId: number) {
  try {
    const member = await ctx.api.getChatMember(ctx.config.groupChatId, userId)

    return MEMBER_STATUSES.has(member.status)
      || (member.status === 'restricted' && member.is_member)
  }
  catch (error) {
    ctx.logger.warn({ msg: 'Failed to check group membership', err: error })
    return false
  }
}

/**
 * Telegram bots can't add users to a group directly, so we issue a personal
 * one-time invite link (member_limit: 1) with a limited lifetime.
 * The bot must be an admin of the group with the "Invite users" permission.
 */
export async function createPersonalInviteLink(ctx: Context, userId: number) {
  const { groupChatId, inviteLinkTtl } = ctx.config

  // In case the user was removed from the group earlier — lift the ban,
  // otherwise the invite link won't work for them.
  await ctx.api.unbanChatMember(groupChatId, userId, { only_if_banned: true })
    .catch(error => ctx.logger.warn({ msg: 'Failed to unban user', err: error }))

  const link = await ctx.api.createChatInviteLink(groupChatId, {
    name: `user-${userId}`.slice(0, 32),
    member_limit: 1,
    expire_date: Math.floor(Date.now() / 1000) + inviteLinkTtl,
  })

  return link.invite_link
}
