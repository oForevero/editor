import { isRecord } from '@tool-belt/type-predicates'

import { defaultOptions, ojbectSchema } from '@/options'

export const getOpitons = (propsOptions: unknown, globalOptions?: unknown) => {
  const propsOptionsValue =
    isRecord(propsOptions) && Object.keys(propsOptions).includes('value')
      ? propsOptions.value
      : propsOptions

  const componentOptions = Object.keys(propsOptionsValue).reduce<
    Record<string, unknown>
  >((acc: Record<string, unknown>, key: string) => {
    if (propsOptionsValue[key] !== undefined) {
      acc[key] = propsOptionsValue[key]
    }
    return acc
  }, {})

  const options = ojbectSchema.merge(
    defaultOptions,
    globalOptions || {},
    componentOptions,
  )

  return options
}
