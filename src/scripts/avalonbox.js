const Avalonbox = (function(){
  let active = false,
      overlay,
      frame,
      current_link,
      box = 'avalonbox',
      buttons = {}

  function hideOverlay(e){
    if (!frame.container.contains(e.target)){
      cleanFrame()
    }
  }

  function cleanFrame(){
    overlay.style.display = 'none'
    frame.image.src = ""
    active = false
  }

  function showOverlay(e){
    e.preventDefault()
    active = true
    overlay.style.display = 'block'
    current_link = e.target.parentNode
    frame.image.src = current_link.getAttribute('href')
    frame.link.href = current_link.getAttribute('href')
  }

  function next(e){
    current_link = current_link.nextElementSibling
      ? current_link.nextElementSibling
      : current_link
    if (current_link) {
      frame.image.src = current_link.getAttribute('href')
      frame.link.href = current_link.getAttribute('href')
    }
  }

  function previous(e){
    current_link = current_link.previousElementSibling
      ? current_link.previousElementSibling
      : current_link
    if (current_link) {
      frame.image.src = current_link.getAttribute('href')
      frame.link.href = current_link.getAttribute('href')
    }
  }

  function createPreviousButton(){
    let prev = document.createElement('button')
    prev.id = "previous"
    prev.className = `${box}-prev-button`
    prev.innerHTML = "&lt"
    prev.type = "button"
    return prev
  }

  function createNextButton(){
    let next = document.createElement('button')
    next.id = "next"
    next.className = `${box}-next-button`
    next.innerHTML = "&gt"
    next.type = "button"
    return next
  }

  function createFrame(target){
    let frame = document.createElement('div')
    frame.id = `${box}-frame`
    frame.className = `${box}-frame`

    let image = document.createElement('img')
    image.className = `${box}-frame-image`
    image.id = `${box}-frame-image`

    let link = document.createElement('a')
    link.target = "_blank"
    link.appendChild(image)
    frame.appendChild(link)
    return {container: frame, image: image, link: link}
  }

  function createOverlayBox(){
    let overlay = document.createElement('div')
    overlay.className = `${box}-overlay`
    overlay.id = `${box}-overlay`
    document.getElementsByTagName('body')[0].appendChild(overlay)
    return overlay
  }

  function init(query){
    overlay = createOverlayBox()
    frame = createFrame()
    buttons.prev = createPreviousButton()
    buttons.next = createNextButton()
    frame.container.appendChild(buttons.prev)
    frame.container.appendChild(buttons.next)
    overlay.appendChild(frame.container)

    eventHandlers(query)
  }

  function eventHandlers(query){
    let links = document.getElementById(query.replace('#', ''))
      .getElementsByTagName('a')
    for (let link of links)
      bind(link, 'click', showOverlay)

    bind(overlay, 'click', hideOverlay)
    bind(buttons.prev, 'click', previous)
    bind(buttons.next, 'click', next)
    bind(document, 'keydown', keyPressHandler)
  }

  function keyPressHandler(e){
    e = e || window.event

    if (!active)
      return

    if (e.keyCode == '37')
      previous()
    else if (e.keyCode == '39')
      next()
  }

  function bind(element, event, callback, useCapture) {
    element.addEventListener(event, callback, useCapture)
  }

  return {
    init: init
  }
})()

module.exports = Avalonbox
