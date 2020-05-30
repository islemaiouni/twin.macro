import dlv from 'dlv'
import { staticStyles, dynamicStyles } from './../config'
import { isEmpty } from './../utils'

const isStaticClass = className => {
  const staticConfig = dlv(staticStyles, [className, 'config'])
  const staticConfigOutput = dlv(staticStyles, [className, 'output'])
  const staticConfigKey = staticConfigOutput
    ? Object.keys(staticConfigOutput).shift()
    : null

  return Boolean(staticConfig || staticConfigKey)
}

const getDynamicProperties = className => {
  // Get an array of matches (eg: ['col', 'col-span'])
  const dynamicKeyMatches =
    Object.keys(dynamicStyles).filter(
      k => className.startsWith(k + '-') || className === k
    ) || []

  // Get the best match from the match array
  const dynamicKey = dynamicKeyMatches.reduce(
    (r, match) => (r.length < match.length ? match : r),
    []
  )
  const dynamicConfig = dlv(dynamicStyles, dynamicKey)

  // See if the config property is defined
  const isDynamicClass = Boolean(
    Array.isArray(dynamicConfig)
      ? dynamicConfig.map(i => dlv(i, 'config'))
      : dlv(dynamicStyles, [dynamicKey, 'config'])
  )
  return { isDynamicClass, dynamicConfig, dynamicKey }
}

const getProperties = (className, state) => {
  if (!className) return
  const isStatic = isStaticClass(className)
  const { isDynamicClass, dynamicConfig, dynamicKey } = getDynamicProperties(
    className
  )
  const corePlugin = dynamicConfig.plugin
  const hasUserPlugins = !isEmpty(state.config.plugins)

  const type =
    (isStatic && 'static') ||
    (isDynamicClass && 'dynamic') ||
    (corePlugin && 'corePlugin')

  return {
    type,
    corePlugin,
    hasNoMatches: !type,
    dynamicKey,
    dynamicConfig,
    hasUserPlugins,
  }
}

export default getProperties
