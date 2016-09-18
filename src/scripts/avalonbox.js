import  * as html from './html'
import bind from './bind'
import delegate from './delegate'

const Avalonbox = (function(){
  const doc = document
  const buttons = {}
  const overlay = html.createOverlayBox(doc)
  const frame = html.createFrame(doc)
  const spinner = html.createSpinner(doc)
  const spinnerWrapper = html.createSpinnerWrapper(doc)
  const downloadImage = new Image()

  let active
  let currentLink

  initialize()

  function initialize(){
    active = false
    html.hide(overlay)
    html.appendChild(doc, overlay)
    buttons.prev = html.createPreviousButton(doc)
    buttons.next = html.createNextButton(doc)
    spinnerWrapper.appendChild(spinner)
    overlay.appendChild(frame.container)
    overlay.appendChild(spinnerWrapper)
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
    html.hide(overlay)
    frame.image.src = ""
    active = false
  }

  function showOverlay(e){
    e.preventDefault()
    active = true
    html.show(overlay)
    currentLink = e.delegateTarget
    loadImage()

    if (single(e.currentTarget.id)) {
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
    frame.image.src = ''
    html.hide(frame.image)
    html.show(spinner)
    downloadImage.onload = function(){
      html.show(frame.image)
      frame.image.src = this.src
      html.hide(spinner)
    }

    downloadImage.src = currentLink.getAttribute('href')
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
    const el = document.getElementById(query)
    const filterLinks = x => x.tagName.toLowerCase() == 'a'
    el.addEventListener('click', delegate(filterLinks, showOverlay))
  }

  function keyPressHandler(event){
    const e = event || window.event

    if (!active)
      return

    if (e.keyCode == '37')
      previous(e)
    else if (e.keyCode == '39')
      next(e)
  }

  return {
    run
  }
})()

module.exports = Avalonbox
