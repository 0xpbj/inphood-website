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

export function parseCaption(caption) {
  const regex = /[^\r\n]+/g
  const file = require("raw-loader!../data/ingredients.txt")
  const fileWords = new Set(file.match(regex))
  let ingredients = ''
  let lowerCaption = caption.toLowerCase()
  for (let i of fileWords) {
    if (lowerCaption.indexOf(i) !== -1)
      ingredients += 'amount? units? ' + i + '\n'
  }
  return ingredients
}

function combineData(data) {
  let ret = []
  let names = []
  for (let i of data) {
    let index = names.indexOf(i.name)
    if (index === -1) {
      names.push(i.name)
      ret.push(i)
    }
    // else {
    //   let info1 = {
    //     name: i.name,
    //     amount: i.amount,
    //     unit: i.unit,
    //   }
    //   let info2 = {
    //     name: data[index].name,
    //     amount: data[index].amount,
    //     unit: data[index].unit
    //   }
    //   console.log('Need to combine: ', info1, info2);
    // }
  }
  return ret
}

export function parseRecipe(data) {
  const regex = /[^\r\n]+/g
  const sRegex = /([^\.\*:><^#~] ?)([a-zA-Z0-9½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/, ()]+)/g
  let phrases = data.match(regex)
  var ingp = require('../algorithms/parser/ingredientparser')
  let parsedData = []
  let missingData = []
  if (!phrases)
    return
  // const file = require("raw-loader!../data/ingredients.txt")
  // const fileWords = new Set(file.match(regex))
  for (let i of phrases) {
    let reg = i.match(sRegex)
    let str = ''
    for (let x of reg) {
      str += x
    }
    let clean = str !== '' ? removeSpecialChars(str) : i
    let parsed = ingp.parse(clean.toLowerCase())
    parsedData.push(parsed)
    // let flag = false
    // let results = []
    // for (let i of fileWords) {
    //   if (parsed.name.indexOf(i) !== -1) {
    //     results.push(i)
    //     flag = true
    //   }
    // }
    // if (!flag){
    //   missingData.push(parsed.name)
    // }
    // else if (results.length > 1) {
    //   const levenshtein = require('fast-levenshtein')
    //   let sortedData = []
    //   for (let i of results) {
    //     let d = levenshtein.get(parsed.name, i)
    //     sortedData.push({info: i, distance: d})
    //   }
    //   sortedData.sort(function(a, b) {
    //     return a.distance - b.distance
    //   })
    //   parsed.clean = sortedData[0].info
    //   parsedData.push(parsed)
    // }
    // else {
    //   parsed.clean = results[0]
    //   parsedData.push(parsed)
    // }
  }
  return {missing: missingData, found: combineData(parsedData)}
  // return {missing: [], found: parsedData}
}