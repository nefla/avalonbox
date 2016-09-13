import  * as html from './html'
import bind from './bind'

const Avalonbox = (function(){
  const doc = document
  const box = 'avalonbox'
  const buttons = {}
  const overlay = html.createOverlayBox(doc, box)
  const frame = html.createFrame(doc, box)

  let active
  let currentLink

  initialize()

  function initialize(){
    active = false
    html.appendChild(doc, overlay)
    buttons.prev = html.createPreviousButton(doc, box)
    buttons.next = html.createNextButton(doc, box)
    frame.container.appendChild(buttons.prev)
    frame.container.appendChild(buttons.next)
    overlay.appendChild(frame.container)
    overlay.appendChild(buttons.prev)
    overlay.appendChild(buttons.next)


    bind(overlay, 'click', hideOverlay)
    bind(buttons.prev, 'click', previous)
    bind(buttons.next, 'click', next)
    bind(doc, 'keydown', keyPressHandler)
  }

  function hideOverlay(e){
    let f = frame.container;
    if ((f === e.target) || (! f.contains(e.target)))
      cleanFrame()
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
    currentLink = e.target.parentNode

    loadImage()

    if (single(currentLink.parentNode.id)) {
      html.hide(buttons.prev)
      html.hide(buttons.next)
    } else {
      if (currentLink.previousElementSibling)
        html.show(buttons.prev)
      else
        html.hide(buttons.prev)

      if (currentLink.nextElementSibling)
        html.show(buttons.next)
      else
        html.hide(buttons.next)
    }
  }

  function next(e){
    html.show(buttons.prev)
    if (currentLink.nextElementSibling) {
      currentLink = currentLink.nextElementSibling
      loadImage()
      if (!currentLink.nextElementSibling)
        html.hide(buttons.next)
    }

    e.stopPropagation()
  }

  function previous(e){
    html.show(buttons.next)
    if (currentLink.previousElementSibling) {
      currentLink = currentLink.previousElementSibling
      loadImage()
      if (! currentLink.previousElementSibling)
        html.hide(buttons.prev)
    }

    e.stopPropagation()
  }

  function loadImage(){
    frame.image.src = "";
    let downloadImage = new Image()
    downloadImage.onload = function(){
      frame.image.src = this.src
    }

    setTimeout(() => {
      downloadImage.src = currentLink.getAttribute('href')
    }, 100)

    frame.link.href = currentLink.getAttribute('href')
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
