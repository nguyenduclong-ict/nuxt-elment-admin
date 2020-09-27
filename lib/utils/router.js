import { cloneDeep, defaultsDeep, isEqual, pick } from '~/lib/utils/lodash'

export function createRouter(items, def) {
  items.forEach((item) => initItem(item, def))
  return items
}

function initItem(item, def) {
  const defaultItem = {
    sidebar: false,
    meta: {
      condition: {
        role: 'some',
        permission: 'some',
      },
    },
  }

  defaultsDeep(item, def, defaultItem)

  if (item.children) {
    createRouter(item.children, { sidebar: item.sidebar })
  }
}

export function getSidebar(routes) {
  return cloneDeep(routes).filter((item) => {
    if (!item.sidebar) {
      return
    }
    if (item.children) {
      item.children = getSidebar(item.children)
    }
    return item
  })
}

export function findRoute(routes, condition) {
  let result
  let findFunction

  if (typeof condition === 'function') {
    findFunction = condition
  } else {
    findFunction = (item) =>
      isEqual(pick(item, ...Object.keys(condition)), condition)
  }

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]
    if (findFunction(route)) {
      result = route
      break
    }
    if (route.children) {
      result = findRoute(route.children, condition)
      if (result) {
        break
      }
    }
  }
  return result
}

export function findHistoryRoute(routes, condition) {
  const result = []
  let findFunction

  if (typeof condition === 'function') {
    findFunction = condition
  } else {
    findFunction = (item) =>
      isEqual(pick(item, ...Object.keys(condition)), condition)
  }

  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]
    if (findFunction(route)) {
      result.push(route)
      break
    }
    if (route.children) {
      result.push(...findHistoryRoute(route.children, condition))
      if (result.length) {
        result.push(route)
        break
      }
    }
  }
  return result
}

let source = {
  roles: [],
  permission: [],
}

export function setSource(data) {
  // eslint-disable-next-line no-unused-vars
  source = data
}

export function checkPermission(source, permission, condition = 'or') {
  const permissions = Array.isArray(permission) ? permission : [permission]
  const set = new Set(source)

  if (condition === 'or') {
    return permissions.some((p) => set.has(p))
  }

  if (condition === 'and') {
    return permissions.every((p) => set.has(p))
  }
}