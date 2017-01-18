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
    this._suggestedServingAmount = 100
  }

  initializeFromSerialization(serialization) {
    // TODO: check to make sure this has the right properties etc.
    // let ingredients = serialization.NutritionModel.ingredients
    // for (let key in ingredients) {
    //   let ingredient = ingredients[key]
    //   console.log("Key: " + key)
    //   console.log(ingredient)
    // }
  }

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {NutritionModel: this}
    return JSON.stringify(typeToInstance)
  }

  addIngredient(key, anIngredient, quantity, unit) {
    this._scaledIngredients[key] = new ScaledIngredient(anIngredient)
    this._scaledIngredients[key].setRecipeAmount(quantity, unit)
  }

  getScaledIngredient(tag) {
    for (let key in this._scaledIngredients) {
      let scaledIngredient = this._scaledIngredients[key]
      if (tag === scaledIngredient.getIngredientModel()._tag) {
        return scaledIngredient
      }
    }

    return null
  }

  getIngredientModel(tag) {
    let scaledIngredient = this.getScaledIngredient(tag)
    if (scaledIngredient !== null) {
      return scaledIngredient.getIngredientModel()
    }

    return null
  }

  removeIngredient(key) {
    if (key in this._scaledIngredients) {
      delete this._scaledIngredients[key]
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

  setSuggestedServingAmount(amount) {
    this._suggestedServingAmount = amount
  }

  getScaledCompositeIngredientModel() {
    var compositeIngredient = new IngredientModel()
    compositeIngredient.initializeComposite(this._scaledIngredients)
    compositeIngredient.setServingAmount(this._suggestedServingAmount)
    return compositeIngredient
  }
}
