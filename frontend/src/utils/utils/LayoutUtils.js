const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
svg.append(text)

export function getSvgTextSize(str, fontSize, fontFamily) {
  document.body.append(svg)
  if (fontSize) {
    text.setAttribute('font-size', fontSize)
  }
  if (fontFamily) {
    text.setAttribute('font-family', fontFamily)
  }
  text.innerHTML = str
  const {width, height} = text.getBBox()
  document.body.removeChild(svg)
  return {width, height}
}
