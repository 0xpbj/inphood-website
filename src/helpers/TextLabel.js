import {IngredientModel} from '../components/models/IngredientModel'

function padLineWithSpaces(charsToPad, line) {
  console.log('padLineWithSpaces:')
  console.log('---------------------------------------------------------------')
  console.log(line)
  console.log(charsToPad)
  console.log(line.length)
  console.log(charsToPad - line.length)

  const lineLength = line.length
  for (let i = 0; i < (charsToPad - lineLength); i++) {
    line += ' '
  }
  return line
}

export function getTextLabel(anIngredientModel) {
  const microNutrientsAndFnPfxs = IngredientModel.microNutrientsAndFnPfxs

  const numSpacesToRDA = 35
  let textLabel = 'Nutrition Facts\n'
  textLabel +=    'Serving Size       : ' + anIngredientModel.getServingAmount() + ' ' + anIngredientModel.getServingUnit() + '\n'
  textLabel +=    '==========================================\n'
  textLabel +=    'Calories           : ' + anIngredientModel.getCalories() + '\n'
  textLabel +=    '------------------------------------------\n'

  let line =      'Total Fat          : ' + anIngredientModel.getTotalFatPerServing() + ' ' +  anIngredientModel.getTotalFatUnit();
  line = padLineWithSpaces(numSpacesToRDA, line);
  line +=  '(' + anIngredientModel.getTotalFatRDA() + '% RDA)\n'
  textLabel += line

  line =          '  Saturated Fat    : ' +  anIngredientModel.getSaturatedFatPerServing() + ' ' + anIngredientModel.getSaturatedFatUnit()
  line = padLineWithSpaces(numSpacesToRDA, line)
  line += '(' + anIngredientModel.getSaturatedFatRDA() + '% RDA)\n'
  textLabel += line

  textLabel +=    '  Trans Fat        : ' + anIngredientModel.getTransFatPerServing() + ' ' + anIngredientModel.getTransFatUnit() + '\n'

  line =          'Cholesterol        : ' + anIngredientModel.getCholestorol() + ' ' + anIngredientModel.getCholestorolUnit()
  line = padLineWithSpaces(numSpacesToRDA, line)
  line += '(' + anIngredientModel.getCholestorolRDA() + '% RDA)\n'
  textLabel += line

  line =          'Sodium             : ' + anIngredientModel.getSodium() + ' ' + anIngredientModel.getSodiumUnit()
  line = padLineWithSpaces(numSpacesToRDA, line)
  line += '(' + anIngredientModel.getSodiumRDA() + '% RDA)\n'
  textLabel += line

  line =          'Total Carbohydrate : ' + anIngredientModel.getTotalCarbohydratePerServing() + ' ' + anIngredientModel.getTotalCarbohydrateUnit()
  line = padLineWithSpaces(numSpacesToRDA, line)
  line += '(' + anIngredientModel.getTotalCarbohydrateRDA() + '% RDA)\n'
  textLabel += line

  line =          '  Dietary Fiber    : ' + anIngredientModel.getDietaryFiber() + ' ' + anIngredientModel.getDietaryFiberUnit()
  line = padLineWithSpaces(numSpacesToRDA, line)
  line += '(' + anIngredientModel.getDietaryFiberRDA() + '% RDA)\n'
  textLabel += line

  textLabel +=    '  Sugars           : ' + anIngredientModel.getSugars() + ' ' + anIngredientModel.getSugarsUnit() + '\n'
  textLabel +=    'Protein            : ' + anIngredientModel.getTotalProteinPerServing() + ' ' + anIngredientModel.getTotalProteinUnit() + '\n'
  textLabel +=    '------------------------------------------\n'
  for (let nutrient in microNutrientsAndFnPfxs) {
    // C+P straight out of NutritionEstimateJSX.
    // TODO: think about re-use, non-repeat.
    //
    const functionPrefix = microNutrientsAndFnPfxs[nutrient]

    const value = anIngredientModel[functionPrefix]()
    let unit = anIngredientModel[functionPrefix + 'Unit']()
    let rda2k = anIngredientModel[functionPrefix + 'RDA']()

    if (unit === 'µg') {  // Convert 'µg' to 'mcg':
      unit = 'mcg'
    }

    if (rda2k === undefined || isNaN(rda2k)) {  // Handle special cases:
      if (functionPrefix === 'get_vitaminA') {
        rda2k = anIngredientModel['get_vitaminA_IURDA']()
      } else if (functionPrefix === 'get_vitaminD') {
        rda2k = anIngredientModel['get_vitaminD_IURDA']()
      } else {
        console.log('RDA based on 2k calorie diet unavailable.');
        rda2k = ''
      }
    }
    if (rda2k != '') {
      rda2k = rda2k + '%'
    }

    const charsToColon = 19
    let rowText = nutrient
    for (let i = 0; i < (charsToColon - nutrient.length); i++) {
      rowText += ' '
    }

    rowText += ': ' + value + ' ' + unit


    const charsToRDA = 32
    const rowTextLength = rowText.length
    for (let i = 0; i < (charsToRDA - rowTextLength); i++) {
      rowText += ' '
    }
    rowText += '(' + rda2k + ' RDA)\n'

    textLabel += rowText
  }
  textLabel +=    '==========================================\n'
  textLabel +=    '* RDA (Recommended Daily Allowance) is\n' +
                  'based on a 2,000 calorie diet. Your\n' +
                  'daily values may be higher or lower\n' +
                  'depending on your calorie needs.\n'
  return textLabel
}
