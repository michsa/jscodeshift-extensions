const fancyFilter = require('./utils').fancyFilter
const Collection = require('jscodeshift/src/Collection')
const NodeCollection = require('jscodeshift/src/collections/Node')
const once = require('jscodeshift/src/utils/once')
const recast = require('recast')
const j = require('jscodeshift')

const { JSXElement } = recast.types.namedTypes

const extensions = {
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
    return this.filter(p => fancyFilter(name, p.value.openingElement.name.name))
  },
}

function register({ include, exclude } = {}) {
  const includes = Object.keys(extensions).filter(k => {
    let shouldInclude = true
    if (include && Array.isArray(include)) shouldInclude = include.includes(k)
    if (exclude && Array.isArray(exclude)) shouldInclude &= !exclude.includes(k)
    return shouldInclude
  })

  j.registerMethods(
    includes.reduce((acc, k) => ({ ...acc, [k]: extensions[k] }), {}),
    j.JSXElement
  )
}

export default once(register)
