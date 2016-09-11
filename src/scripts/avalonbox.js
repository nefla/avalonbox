import  * as html from './html'
import bind from './bind'

const Avalonbox = (function(){
  const doc = document
  const box = 'avalonbox'
  const buttons = {}
  const overlay = html.createOverlayBox(doc, box)
  const frame = html.createFrame(doc, box)

  let active
  let current_link

  initialize()

  function initialize(){
    active = false
    html.appendChild(doc, overlay)
    buttons.prev = html.createPreviousButton(doc, box)
    buttons.next = html.createNextButton(doc, box)
    frame.container.appendChild(buttons.prev)
    frame.container.appendChild(buttons.next)
    overlay.appendChild(frame.container)
    
    bind(overlay, 'click', hideOverlay)
    bind(buttons.prev, 'click', previous)
    bind(buttons.next, 'click', next)
    bind(doc, 'keydown', keyPressHandler)
  }

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

    if (single(current_link.parentNode.id)) {
      html.hide(buttons.prev)
      html.hide(buttons.next)
    } else {
      html.show(buttons.prev)
      html.show(buttons.next)
    }
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

  // TODO: Swap [].slice for Array.from (ES6)
  // Need to test in IE9
  function single(query){
    const links = doc.getElementById(query)
      .getElementsByTagName('a')
    return [].slice.call(links).length == 1
  }

  function run(query){
    eventHandlers(query)
  }

  function eventHandlers(query){
    let links = document.getElementById(query)
      .getElementsByTagName('a')
    links = [].slice.call(links)
    links.forEach(link => {
      bind(link, 'click', showOverlay)
    })

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

  return {
    run
  }
})()

module.exports = Avalonbox
