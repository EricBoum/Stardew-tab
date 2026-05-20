import type { BuiltinIcon } from '@/libs/const/builtinIcons'

type TranslateFn = (key: string) => string
type TranslationExistsFn = (key: string) => boolean

export const getBuiltinIconNameKey = (iconKey: string): string => {
  return `iconLibrary.icons.${iconKey}`
}

export const getBuiltinIconDisplayName = (
  icon: BuiltinIcon,
  t: TranslateFn,
  te: TranslationExistsFn
): string => {
  const nameKey = getBuiltinIconNameKey(icon.key)
  return te(nameKey) ? t(nameKey) : icon.name
}
