function bind(element, event, callback, useCapture) {
  element.addEventListener(event, callback, useCapture)
}

export default bind
