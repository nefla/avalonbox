import bind from './bind'

function createPreviousButton(doc, box){
  const prev = doc.createElement('button')
  prev.id = "previous"
  prev.className = `${box}-prev-button`
  prev.innerHTML = "&lt"
  prev.type = "button"
  return prev
}

function createNextButton(doc, box){
  const next = doc.createElement('button')
  next.id = "next"
  next.className = `${box}-next-button`
  next.innerHTML = "&gt"
  next.type = "button"
  return next
}

function createSpinner(doc, box){
  const spinner = doc.createElement('div')
  spinner.id = `${box}-spinner`
  spinner.className = `${box}-spinner`

  return spinner
}

function createSpinnerWrapper(doc, box) {
  const wrapper = doc.createElement('div')
  wrapper.id = `${box}-spinner-wrapper`
  wrapper.className = `${box}-spinner-wrapper`

  return wrapper
}

function createFrame(doc, box){
  const frame = doc.createElement('div')
  frame.id = `${box}-frame`
  frame.className = `${box}-frame`

  const image = doc.createElement('img')
  image.className = `${box}-frame-image`
  image.id = `${box}-frame-image`

  const link = doc.createElement('a')
  link.appendChild(image)

  bind(link, 'click', e => { e.preventDefault() })

  frame.appendChild(link)
  return {container: frame, image: image, link: link}
}

function createOverlayBox(doc, box){
  const overlay = doc.createElement('div')
  overlay.className = `${box}-overlay`
  overlay.id = `${box}-overlay`
  return overlay
}

function getOverlayBox(doc, box) {
  const overlay = doc.getElementById(`${box}-overlay`)
  return overlay
}

function hide(el) {
  el.className = el.className.replace(' hide', '') + ' hide'
}

function show(el) {
  el.className = el.className.replace(' hide', '')
}

function appendChild(doc, el) {
  doc.getElementsByTagName('body')[0].appendChild(el)

}

export {
  createPreviousButton,
  createNextButton,
  createFrame,
  createOverlayBox,
  createSpinner,
  createSpinnerWrapper,
  getOverlayBox,
  hide,
  show,
  appendChild
}
