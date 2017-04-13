import {IngredientModel} from './IngredientModel'
import {getValueInUnits} from '../../helpers/ConversionUtils'

// Holds an IngredientModel and the scale information, one or both of the following:
//  - _scale (percentage to modify the 100g FDA data)
//  - _recipeQuantity & _recipeUnit (the units used to manipulate the ingredient scale)
class ScaledIngredient {
  constructor(ingredient) {
    // TODO: ensure 0 <= scale <= 100
    //
    this._ingredient = ingredient
    this._scale = 1.0
    this._recipeQuantity = undefined
    this._recipeUnit = undefined
  }

  getScale() {
    return this._scale
  }

  getQuantity() {
    return this._recipeQuantity
  }

  getUnit() {
    return this._recipeUnit
  }

  // Throws if unable to convert units
  setRecipeAmount(recipeQuantity, recipeUnit) {
    this._recipeQuantity = recipeQuantity
    this._recipeUnit = recipeUnit

    // Convert the provided amount and unit to grams. Then knowing that the FDA
    // data is based on 100g servings, calculate a scale factor (percentage) to
    // modify the ingredientModel figures by:
    //
    const valueInGrams = getValueInUnits(recipeQuantity, recipeUnit, 'g', this._ingredient)
    this._scale = valueInGrams / 100.0
  }

  getIngredientModel() {
    return this._ingredient
  }
}

// This class is essentially a composite of IngredientModels
//
// It is designed to permit serialization/deserialization that facilitates continued
// editing of an ingredient after persistence.
//
// It could be collapsed into an Ingredient with factory type facilities, but then IngredientModel
// would be even more bloated.
//
export class NutritionModel {
  constructor() {
    this._scaledIngredients = {}
    this._suggestedServingValue = 100
    this._suggestedServingUnit = 'g'

    // WARNING: these two variables added after serialization had already occured,
    // need to check that they exist when trying to set them in initializeFromSerialization:
    //    (these are the values that put "2 tacos" on the nutrition label)
    this._displayServingCount = 1
    this._displayServingUnit = 'serving'

    // 'Servings Per Recipe, About 4' or '1 serving per container'
    this._displayServingRatio = 'Recipe, About'

    // Persist the type of label in the nutrition model and composite
    // ingredient model. Valid label types include:
    //    - standard
    //    - complete
    //    - micronut
    //    - sugarmic
    //    - text
    //    - personal
    //
    this._labelType = IngredientModel.labelTypes.standard
    this._roundingStyle = 'fda'
  }

  initializeFromSerialization(serializedData) {
    const nutritionData = serializedData.NutritionModel

    this._suggestedServingValue = nutritionData._suggestedServingValue
    this._suggestedServingUnit = nutritionData._suggestedServingUnit

    if (nutritionData.hasOwnProperty('_displayServingCount') &&
        nutritionData.hasOwnProperty('_displayServingUnit')) {
      this._displayServingCount = nutritionData._displayServingCount
      this._displayServingUnit = nutritionData._displayServingUnit
    }

    if (nutritionData.hasOwnProperty('_displayServingRatio')) {
      this._displayServingRatio = nutritionData._displayServingRatio
    }

    //
    // Label Type
    this._labelType = IngredientModel.labelTypes.standard
    if (nutritionData.hasOwnProperty('_labelType')) {
      this._labelType = nutritionData._labelType
    }
    //
    // Rounding style
    this._roundingStyle = 'fda'
    if (nutritionData.hasOwnProperty('_roundingStyle')) {
      this._roundingStyle = nutritionData._roundingStyle
    }

    for (let id in nutritionData._scaledIngredients) {
      const scaledIngredient = nutritionData._scaledIngredients[id]

      const quantity = scaledIngredient._recipeQuantity
      const unit = scaledIngredient._recipeUnit

      const serializedIngredientData = {
        Ingredient: scaledIngredient._ingredient
      }
      let ingredient = new IngredientModel()
      ingredient.initializeFromSerialization(serializedIngredientData)

      try {
        this.addIngredient(id, ingredient, quantity, unit)
      } catch (error) {
        // TODO ...
        console.log('ERROR initializing ingredient, ' + id + ', in nutrition model deserialization.');
      }
    }
  }

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {NutritionModel: this}
    return JSON.stringify(typeToInstance)
  }

  // throws if setRecipeAmount blows up
  // throws if a duplicate id is specified
  addIngredient(id, anIngredient, quantity, unit) {
    if (id in this._scaledIngredients) {
      throw new Error("Id " + id + " already exists in nutrition model.")
    }

    this._scaledIngredients[id] = new ScaledIngredient(anIngredient)

    let errorStr = ''
    try {
      this._scaledIngredients[id].setRecipeAmount(quantity, unit)
    } catch(err) {
      errorStr = err
    } finally {
      // If we weren't successful, remove the added ingredient
      if (errorStr !== '') {
        delete this._scaledIngredients[id]
        throw new Error(errorStr)
      }
    }
  }

  getIds() {
    return (Object.keys(this._scaledIngredients))
  }

  getScaledIngredient(id) {
    if (id in this._scaledIngredients) {
      return this._scaledIngredients[id]
    }

    return null
  }

  getIngredientModel(id) {
    if (id in this._scaledIngredients) {
      return this._scaledIngredients[id].getIngredientModel()
    }

    return null
  }

  removeIngredient(id) {
    if (id in this._scaledIngredients) {
      delete this._scaledIngredients[id]
    }
  }

  // Scale the ingredient figures to the amount in the specified unit.
  //
  scaleIngredientToUnit(id, amount, unit) {
    let scaledIngredient = this.getScaledIngredient(id)
    if (scaledIngredient !== null) {
      scaledIngredient.setRecipeAmount(amount, unit)
    }
  }

  setSuggestedServingAmount(value, unit, displayServingCount, displayServingUnit, displayServingRatio) {
    this._suggestedServingValue = value
    this._suggestedServingUnit = unit
    this._displayServingCount = displayServingCount
    this._displayServingUnit = displayServingUnit
    this._displayServingRatio = displayServingRatio
  }

  getSuggestedServingValue() {
    return this._suggestedServingValue
  }

  getSuggestedServingUnit() {
    return this._suggestedServingUnit
  }

  getDisplayServingCount() {
    return this._displayServingCount
  }

  getDisplayServingUnit() {
    return this._displayServingUnit
  }

  getDisplayServingRatio() {
    return this._displayServingRatio
  }

  getScaledCompositeIngredientModel() {
    var compositeIngredient = new IngredientModel()
    compositeIngredient.initializeComposite(this._scaledIngredients)
    compositeIngredient.setServingAmount(this._suggestedServingValue,
                                         this._suggestedServingUnit,
                                         this._displayServingCount,
                                         this._displayServingUnit,
                                          this._displayServingRatio)
    compositeIngredient.setLabelType(this._labelType)
    compositeIngredient.setRoundingStyle(this._roundingStyle)
    return compositeIngredient
  }

  getLabelType() {
    return this._labelType
  }

  setLabelType(aLabelType) {
    this._labelType = aLabelType
  }

  setRoundingStyle(aRoundingStyle) {
    this._roundingStyle = aRoundingStyle
  }
}
