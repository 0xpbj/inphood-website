export class NutritionModel {
  constructor() {
    this._ingredients = {}
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
  scaleIngredientToPercent(key, scale) {
    if (key in this._ingredients) {
      this._ingredients[key].setScale(scale)
    } else {
      // TODO: Error
    }
  }

  // Scale the ingredient figures to the amount in the specified unit.
  //
  scaleIngredientToUnit(key, amount, unit) {
    // TODO:
    //  - determine the scale factor (percent) by converting the given amount
    // and unit to the Ingredient's _servingUnits and then determining the factor
    // by comparing to the Ingredient's _servingAmount.
  }

  getScaledCompositeIngredient() {
    var compositeIngredient = new Ingredient()
    compositeIngredient.initializeComposite(this._ingredients)
    return compositeIngredient
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

  getScale() {
    return this._scale
  }

  getIngredient() {
    return this._ingredient
  }
}

export class Ingredient {

  constructor() {
    this._ndbno = -1
    this.scaleGettersTo = 1.0
  }

  // This constructor initializes a NutritionItem from the DB/JSON which
  // contains FDA data per 100g of ingredient.
  initializeSingle(key, tag, dataForKey) {
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
    this._saturatedFatRDA = TODO
    this._transFatPerServing = TODO
    this._transFatUnits = 'g'
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = TODO
    this._cholesterolUnits = 'mg'
    this._cholesterolRDA = TODO
    this._sodium = TODO
    this._sodiumUnits = 'mg'
    this._sodiumRDA = TODO
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = dataForKey['Carbohydrate']
    this._totalCarbohydrateUnits = 'g'
    this._totalCarbohydrateRDA = TODO
    this._dietaryFiber = TODO
    this._dietaryFiberUnits = 'g'
    this._dietaryFiberRDA = TODO
    this._sugars = TODO
    this._sugarsUnits = 'g'
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = dataForKey['Protein']
    this._totalProteinUnits = 'g'
    //
    //   National Database Number
    this._ndbno = dataForKey['NDB']
  }

  initializeComposite(ingredientTuples) {
    for (var ingredientTuple in ingredientTuples) {
      const scaleFactor = ingredientTuple.getScale()
      const ingredient = ingredientTuple.getIngredient()

      // TODO add remaining checks for serving unit compatibility or appropriate
      // conversions:

      // Add the ingredients together to get a composite label
      //
      //   Generic measures/units:
      throwIfUnitMismatch('serving size', this._servingUnits,
        ingredient._servingUnits, ingredient._tag, ingredient._key)
      // Only need this assingment on the first ingredient, but in a hurry ...
      this._servingUnits = ingredient._servingUnits
      this._servingAmount += ingredient._servingAmount * scaleFactor
      // TODO: pretty sure this works for calories (everything is linear
      // I believe). Need to confirm.
      this._calories += ingredient._calories * scaleFactor
      this._caloriesFromFat += ingredient._caloriesFromFat * scaleFactor
      //
      //   Fat measures/metrics:
      throwIfUnitMismatch('total fat', this._totalFatUnits,
        ingredient._totalFatUnits, ingredient._tag, ingredient._key)
      // Only need this assingment on the first ingredient, but in a hurry ...
      this._totalFatUnits = ingredient._totalFatUnits
      this._totalFatPerServing += ingredient._totalFatPerServing * scaleFactor
      this._totalFatRDA += ingredient._totalFatRDA * scaleFactor
      this._saturatedFatPerServing += ingredient._saturatedFatPerServing * scaleFactor
      this._saturatedFatRDA += ingredient._saturatedFatRDA * scaleFactor
      this._transFatPerServing += ingredient._transFatPerServing * scaleFactor
      //
      //   Cholesterol & Sodium measures/metrics:
      this._cholesterol += ingredient._cholesterol * scaleFactor
      this._cholesterolRDA += ingredient._cholesterolRDA * scaleFactor
      this._sodium += ingredient._sodium * scaleFactor
      this._sodiumRDA += ingredient._sodiumRDA * scaleFactor
      //
      //   Carbohydrate measures/metrics:
      this._totalCarbohydratePerServing += ingredient._totalCarbohydratePerServing * scaleFactor
      this._totalCarbohydrateRDA += ingredient._totalCarbohydrateRDA * scaleFactor
      this._dietaryFiber += ingredient._dietaryFiber * scaleFactor
      this._dietaryFiberRDA += ingredient._dietaryFiber * scaleFactor
      this._sugars += ingredient._sugars * scaleFactor
      //
      //   Protein measures/metrics:
      this._totalProteinPerServing += ingredient._totalProteinPerServing * scaleFactor
    }
  }

  setServingAmount() {
    // TODO: get the current serving amount and scale all the numbers appropriately
    // for the getter functions.
  }

  getServingAmount() {
    return this._servingAmount * this.scaleGettersTo
  }

  getServingUnit() {
    return this._servingUnit
  }

  getCalories() {
    return this._calories * this.scaleGettersTo
  }

  getCaloriesFromFat() {
    return this._caloriesFromFat * this.scaleGettersTo
  }

  getTotalFatPerServing() {
    return this._totalFatPerServing * this.scaleGettersTo
  }

  getTotalFatUnit() {
    return this._totalFatUnits
  }

  getTotalFatRDA() {
    return this._totalFatRDA * this.scaleGettersTo
  }

  getSaturatedFatPerServing() {
    return this._saturatedFatPerServing * this.scaleGettersTo
  }

  getSaturatedFatUnit() {
    return this._saturatedFatUnits
  }

  getSaturatedFatRDA() {
    return this._saturatedFatRDA
  }

  getTransFatPerServing() {
    return this._transFatPerServing * this.scaleGettersTo
  }

  getTransFatUnit() {
    return this._transFatUnits
  }

  getCholestorol() {
    return this._cholesterol * this.scaleGettersTo
  }

  getCholestorolUnit() {
    return this._cholesterolUnits
  }

  getCholestorolRDA() {
    return this._cholesterolRDA
  }

  getSodium() {
    return this._sodium
  }

  getSodumUnit() {
    return this._sodiumUnits
  }

  getSodiumRDA() {
    return this._sodiumRDA
  }

  getTotalCarbohydratePerServing() {
    return this._totalCarbohydratePerServing
  }

  getTotalCarbohydrateUnit() {
    return this._totalCarbohydrateUnits
  }

  getTotalCarbohydrateRDA() {
    return this._totalCarbohydrateRDA
  }

  getDietaryFiber() {
    return this._dietaryFiber
  }

  getDietaryFiberUnit() {
    return this._dietaryFiberUnits
  }

  getDietaryFiberRDA() {
    return this._dietaryFiberRDA
  }

  getSugars() {
    return this._sugars
  }

  getSugarsUnit() {
    return this.sugarsUnits
  }

  getTotalProteinPerServing() {
    return this._totalProteinPerServing
  }

  getTotalProteinUnit() {
    return this._totalProteinUnits
  }

  throwIfUnitMismatch(category, mainUnit, otherUnit, otherTag, otherKey) {
    if (mainUnit != "") {
      if (mainUnit != otherUnit) {
        throw "Ingredient " + otherTag + "(" + otherKey
              + ") uses different units, " + otherUnit
              + ", from other ingredients: " + mainUnit + " "
              + category + "."
      }
    }
  }
}
