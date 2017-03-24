function switchSpecial(s, i) {
  let ret = ''
  switch(s) {
    case "½":
    {
      ret = "1/2"
      break
    }
    case "⅓":
    {
      ret = "1/3"
      break
    }
    case "⅔":
    {
      ret = "2/3"
      break
    }
    case "¼":
    {
      ret = "1/4"
      break
    }
    case "¾":
    {
      ret = "3/4"
      break
    }
    case "⅕":
    {
      ret = "1/5"
      break
    }
    case "⅖":
    {
      ret = "2/5"
      break
    }
    case "⅗":
    {
      ret = "3/5"
      break
    }
    case "⅘":
    {
      ret = "4/5"
      break
    }
    case "⅙":
    {
      ret = "1/6"
      break
    }
    case "⅚":
    {
      ret = "5/6"
      break
    }
    case "⅛":
    {
      ret = "1/8"
      break
    }
    case "⅜":
    {
      ret = "3/8"
      break
    }
    case "⅝":
    {
      ret = "5/8"
      break
    }
    case "⅞":
    {
      ret = "7/8"
      break
    }
    default:
    {
      return s
    }
  }
  ret = i ? (" " + ret) : ret
  return ret
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
      clean += switchSpecial(str[i], i)
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
  const sRegex = /([^\*:><^#~] ?)([\.\-a-zA-Z0-9½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞/, ()]+)/g
  let phrases = data.match(regex)
  var ingp = require('../algorithms/parser/ingredientparser')
  let parsedData = []
  let missingData = []
  if (phrases) {
    for (let i of phrases) {
      let reg = i.match(sRegex)
      let str = ''
      if (reg) {
        for (let x of reg) {
          str += x
        }
        let clean = str !== '' ? removeSpecialChars(str) : i
        let parsed = ingp.parse(clean.toLowerCase())
        parsedData.push(parsed)
      }
    }
  }
  return {missing: missingData, found: combineData(parsedData)}
}