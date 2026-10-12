/**
 * Port of IconService: unicode icons used across the UI
 */
export const ICONS = {
  DISCUSSION: '🗨',
  BACK: '❮',
  FORWARD: '❯',
  UNPACK: 'ᐁ',
  OPENED: '>',
  CLOSED: 'V',
  CHECKMARK: '✓',
  EMAIL: '🖃',
  SCHOOL: '🎓',
  LOCATION: '🖈',
  EDIT: '🖉',
  CROSS: '☓',
  WARNING: '⚠',
  DISCORD: '💬',
  DELETE: '🗑',
  ADD: '+',
  LINK: '🔗',
} as const;

export type IconName = keyof typeof ICONS;
