const fancyFilter = (filter, data) => {
  if (typeof filter === 'object' && filter.test) {
    return filter.test(data)
  }
  if (typeof filter === 'string') {
    return data === filter
  }
  if (Array.isArray(filter)) {
    return filter.includes(data)
  }
}

const extensions = j => ({
  addAttributes(newAttrs, { overwrite } = {}) {
    return this.forEach(p => {
      const attributes = p.value.openingElement.attributes
      const props = attributes.reduce(
        (acc, x) => ({ ...acc, [x.name.name]: x }),
        {}
      )
      Object.entries(newAttrs).forEach(([k, v]) => {
        if (Object.keys(props).includes(k)) {
          console.log('found prop:', k, props[k])
          if (overwrite) props[k].value.value = v
        } else {
          console.log('not found:', k)
          attributes.push(j.jsxAttribute(j.jsxIdentifier(k), j.literal(v)))
        }
      })
      console.log(newAttrs, props)
    })
  },

  renameTo(name) {
    return this.forEach(p => {
      p.value.openingElement.name.name = name
      if (p.value.closingElement) p.value.closingElement.name.name = name
    })
  },

  filterByName(name) {
    return this.filter(p => fancyFilter(name, p.value.name))
  }
})

export default function(j, { include, exclude } = {}) {
  const fns = extensions(j)

  const includes = Object.keys(fns).filter(k => {
    let shouldInclude = true
    if (include && Array.isArray(include)) shouldInclude = include.includes(k)
    if (exclude && Array.isArray(exclude)) shouldInclude &= !exclude.includes(k)
    return shouldInclude
  })

  const methodsToRegister = includes.reduce(
    (acc, k) => ({ ...acc, [k]: fns[k] }),
    {}
  )
  console.log(methodsToRegister)

  j.registerMethods(methodsToRegister, j.JSXElement)
}
