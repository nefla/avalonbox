const delegate = function(criteria, listener) {
  return function(e) {
    const el = e.target
    do {
      if (!criteria(el))
        continue
      e.delegateTarget = el
      listener.apply(this, arguments)
      return
    } while((el = el.parentNode))
  }
}

export default delegate
