function switchSpecial(s) {
  switch(s) {
    case "½":
      return "1/2"
    case "⅓":
      return "1/3"
    case "⅔":
      return "2/3"
    case "¼":
      return "1/4"
    case "¾":
      return "3/4"
    case "⅕":
      return "1/5"
    case "⅖":
      return "2/5"
    case "⅗":
      return "3/5"
    case "⅘":
      return "4/5"
    case "⅙":
      return "1/6"
    case "⅚":
      return "5/6"
    case "⅛":
      return "1/8"
    case "⅜":
      return "3/8"
    case "⅝":
      return "5/8"
    case "⅞":
      return "7/8"
    default:
      return s
  }
}

function removeSpecialChars(str) {
  const regex = /(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)/g
  if (str.match(regex) === null)
    return str
  let clean = ''
  let index = []
  let match
  while ((match = regex.exec(str)) != null) {
    index.push(match.index)
  }
  let m = 0
  for (let i = 0; i < str.length; i++) {
    if (index.length > 0 && i === index[m]) {
      clean += switchSpecial(str[i])
      m++
    }
    else {
      clean += str[i]
    }
  }
  return clean
}

export function parseRecipe(data) {
  let regex = /[^\r\n]+/g
  let phrases = data.match(regex)
  var ingp = require('../algorithms/parser/ingredientparser')
  let parsedData = []
  if (!phrases)
    return
  let flag1 = false
  let flag2 = false
  let flag3 = false
  for (let i of phrases) {
    let clean = removeSpecialChars(i)
    let parsed = ingp.parse(clean)
    console.log('Parsed: ', parsed)
    if (!flag3 && flag2 && flag1)
      flag3 = true
    if (!flag1 && parsed.name === 'inPhood:')
      flag1 = true
    if (!flag2 && flag1 && parsed.name === '---------')
      flag2 = true
    if (flag3)
      parsedData.push(parsed)
  }
  return parsedData
}