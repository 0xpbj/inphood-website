export class NutritionModel {
  constructor() {
    this._ingredients = {}
  }

  addIngredient(key, anIngredient) {
    this.addIngredient(key, anIngredient, 100.0)
  }

  addIngredient(key, anIngredient, scale) {
    this._ingredients[key] = new IngredientTuple(anIngredient, scale)
  }

  removeIngredient(key) {
    if (key in this._ingredients) {
      delete this._ingredients[key]
    }
  }

  // Scale the ingredient figures to scale percentage.
  //
  //   0.0 <= scale <= 100.0
  scaleIngredient(key, scale) {
    if (key in this._ingredients) {
      this._ingredients[key].setScale(scale)
    } else {
      // TODO: Error
    }
  }

  // Scale the ingredient figures to the amount in the specified unit.
  //
  scaleIngredient(key, amount, unit) {
    // TODO:
    //  - determine the scale factor (percent) by converting the given amount
    // and unit to the Ingredient's _servingUnits and then determining the factor
    // by comparing to the Ingredient's _servingAmount.
  }

  getScaledCompositeIngredient() {
    // TODO:
  }
}

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
}

export class Ingredient {

  // This constructor initializes a NutritionItem from the DB/JSON which
  // contains FDA data per 100g of ingredient.
  constructor(key, tag, dataForKey) {
    this._key = key
    this._tag = tag

    const TODO = 0

    // Pull data from DB/JSON to initialize remainder of class instance:
    //
    //   Generic measures/units:
    this._servingAmount = 100
    this._servingUnits = 'g'
    this._calories = TODO
    this._caloriesFromFat = TODO
    //
    //   Fat measures/metrics:
    this._totalFatPerServing = dataForKey['Fat']
    this._totalFatUnits = 'g'
    this._totalFatRDA = TODO
    this._saturatedFatPerServing = TODO
    this._saturatedFatUnits = 'g'
    this._transFatPerServing = TODO
    this._transFatUnits = 'g'
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = TODO
    this._cholesterolUnits = 'mg'
    this._sodium = TODO
    this._sodiumUnits = 'mg'
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = dataForKey['Carbohydrate']
    this._totalCarbohydrateUnits = 'g'
    this._dietaryFiber = TODO
    this._dietaryFiberUnits = 'g'
    this._sugars = TODO
    this._sugarUnits = 'g'
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = dataForKey['Protein']
    this._totalProteinUnits = 'g'
    //
    //   National Database Number
    this._ndbno = dataForKey['NDB']
  }
}
