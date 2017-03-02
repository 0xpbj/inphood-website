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
  }

  initializeFromSerialization(serializedData) {
    const nutritionData = serializedData.NutritionModel

    this._suggestedServingValue = nutritionData._suggestedServingValue
    this._suggestedServingUnit = nutritionData._suggestedServingUnit

    const append = false
    for (let tag in nutritionData._scaledIngredients) {
      const scaledIngredient = nutritionData._scaledIngredients[tag]

      const quantity = scaledIngredient._recipeQuantity
      const unit = scaledIngredient._recipeUnit

      const serializedIngredientData = {
        Ingredient: scaledIngredient._ingredient
      }
      let ingredient = new IngredientModel()
      ingredient.initializeFromSerialization(serializedIngredientData)

      try {
        this.addIngredient(tag, ingredient, quantity, unit, append)
      } catch (error) {
        // TODO ...
        console.log('ERROR initializing ingredient, ' + tag + ', in nutrition model deserialization.');
      }
    }
  }

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {NutritionModel: this}
    return JSON.stringify(typeToInstance)
  }

  // throws if setRecipeAmount blows up
  // throws if a duplicate tag is specified
  addIngredient(tag, anIngredient, quantity, unit, append) {
    if (tag in this._scaledIngredients && !append) {
      throw new Error('tag already exists in nutrition model: ' + tag)
    }

    this._scaledIngredients[tag] = new ScaledIngredient(anIngredient)

    let errorStr = ''
    try {
      this._scaledIngredients[tag].setRecipeAmount(quantity, unit)
    } catch(err) {
      errorStr = err
    } finally {
      // If we weren't successful, remove the added ingredient
      if (errorStr !== '') {
        delete this._scaledIngredients[tag]
        throw new Error(errorStr)
      }
    }
  }

  getTags() {
    return (Object.keys(this._scaledIngredients))
  }

  getScaledIngredient(tag) {
    if (tag in this._scaledIngredients) {
      return this._scaledIngredients[tag]
    }

    return null
  }

  getIngredientModel(tag) {
    if (tag in this._scaledIngredients) {
      return this._scaledIngredients[tag].getIngredientModel()
    }

    return null
  }

  removeIngredient(tag) {
    if (tag in this._scaledIngredients) {
      delete this._scaledIngredients[tag]
    }
  }

  // Scale the ingredient figures to the amount in the specified unit.
  //
  scaleIngredientToUnit(tag, amount, unit) {
    let scaledIngredient = this.getScaledIngredient(tag)
    if (scaledIngredient !== null) {
      scaledIngredient.setRecipeAmount(amount, unit)
    }
  }

  setSuggestedServingAmount(value, unit) {
    this._suggestedServingValue = value
    this._suggestedServingUnit = unit
  }

  getScaledCompositeIngredientModel() {
    var compositeIngredient = new IngredientModel()
    compositeIngredient.initializeComposite(this._scaledIngredients)
    compositeIngredient.setServingAmount(this._suggestedServingValue, this._suggestedServingUnit)
    return compositeIngredient
  }
}
