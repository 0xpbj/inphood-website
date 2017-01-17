import {IngredientModel} from './IngredientModel'

// IngredientModel - Scale pair.
//
class IngredientTuple {
  constructor(ingredient, scale) {
    // TODO: ensure 0 <= scale <= 100
    //
    this._ingredient = ingredient
    this._scale = scale
  }

  setScale(scale) {
    this._scale = scale
  }

  getScale() {
    return this._scale
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
    this._ingredients = {}
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

  addIngredient(key, anIngredient, scale) {
    this._ingredients[key] = new IngredientTuple(anIngredient, scale)
  }

  getIngredientTuple(tag) {
    for (let key in this._ingredients) {
      let ingredientTuple = this._ingredients[key]
      if (tag === ingredientTuple.getIngredientModel()._tag) {
        return ingredientTuple
      }
    }

    return null
  }

  getIngredientModel(tag) {
    let ingredientTuple = this.getIngredientTuple(tag)
    if (ingredientTuple !== null) {
      return ingredientTuple.getIngredientModel()
    }

    return null
  }

  removeIngredient(key) {
    if (key in this._ingredients) {
      delete this._ingredients[key]
    }
  }

  // Scale the ingredient figures to scale percentage.
  //
  //   0.0 <= scale <= 100.0
  scaleIngredientToPercent(tag, scale) {
    let ingredientTuple = this.getIngredientTuple(tag)
    if (ingredientTuple !== null) {
      ingredientTuple.setScale(scale)
    }
    
  }

  // Scale the ingredient figures to the amount in the specified unit.
  //
  scaleIngredientToUnit(key, amount, unit) {
    // TODO:
    //  - determine the scale factor (percent) by converting the given amount
    // and unit to the Ingredient's _servingUnit and then determining the factor
    // by comparing to the Ingredient's _servingAmount.
  }

  setSuggestedServingAmount(amount) {
    this._suggestedServingAmount = amount
  }

  getScaledCompositeIngredientModel() {
    var compositeIngredient = new IngredientModel()
    compositeIngredient.initializeComposite(this._ingredients)
    compositeIngredient.setServingAmount(this._suggestedServingAmount)
    return compositeIngredient
  }
}
