import bind from './bind'
const box = 'avalonbox'

function createPreviousButton(doc){
  const prev = doc.createElement('button')
  prev.id = `${box}-prev`
  prev.className = `${box}-move-button ${box}-prev-button`
  prev.innerHTML = "&lt"
  prev.type = "button"
  return prev
}

function createNextButton(doc){
  const next = doc.createElement('button')
  next.id = `${box}-next`
  next.className = `${box}-move-button ${box}-next-button`
  next.innerHTML = "&gt"
  next.type = "button"
  return next
}

function createSpinner(doc){
  const spinner = doc.createElement('div')
  spinner.id = `${box}-spinner`
  spinner.className = `${box}-spinner`

  return spinner
}

function createSpinnerWrapper(doc) {
  const wrapper = doc.createElement('div')
  wrapper.id = `${box}-spinner-wrapper`
  wrapper.className = `${box}-spinner-wrapper`

  return wrapper
}

function createFrame(doc){
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

function createOverlayBox(doc){
  const overlay = doc.createElement('div')
  overlay.className = `${box}-overlay`
  overlay.id = `${box}-overlay`
  return overlay
}

function getOverlayBox(doc) {
  const overlay = doc.getElementById(`${box}-overlay`)
  return overlay
}

function hide(el) {
  el.className = el.className.replace(` ${box}-hide`, '') + ` ${box}-hide`
}

function show(el) {
  el.className = el.className.replace(` ${box}-hide`, '')
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
