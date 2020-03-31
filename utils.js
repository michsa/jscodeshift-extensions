module.exports = {
  fancyFilter: (filter, data) => {
    if (typeof filter === 'object' && filter.test) {
      return filter.test(data)
    }
    if (typeof filter === 'string') {
      return data === filter
    }
    if (Array.isArray(filter)) {
      return filter.includes(data)
    }
  },
}
