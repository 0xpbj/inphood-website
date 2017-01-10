export class NutritionModel {
  constructor() {
    this._ingredients = {}
  }

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {NutritionModel: this}
    return JSON.stringify(typeToInstance)
  }

  deserialize(typeToInstanceString) {
    // TODO:
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
    // and unit to the Ingredient's _servingUnit and then determining the factor
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

// from: https://www.dsld.nlm.nih.gov/dsld/dailyvalue.jsp
var RDA2000Cal = {
  totalFat: 65,
  saturatedFat: 20,
  cholesterol: 300,
  sodium: 2400,
  carbohydrate: 300,
  fiber: 25,
}

// The FDA DB sometimes has values of '--' for nutrition metrics, this method
// converts those to 0.0.  If the value is not '--', this method parses the
// FDA value to a float and returns it.
//
function getFloatFromDB(dataForKey, key) {
  var data = 0.0

  if (key in dataForKey) {
    const field = dataForKey[key]
    if (field == "--") {
      data = 0.0
    } else {
      data = parseFloat(field)
    }
  }

  return data
}

export class Ingredient {
  constructor() {
    this.decimalPlaces = 2

    this._ndbno = -1
    this.scaleGettersTo = 1.0
    //
    //   Generic measures/Unit:
    this._servingAmount = 0
    this._servingUnit = 'g'
    this._calories = 0
    this._caloriesFromFat = 0
    //
    //   Fat measures/metrics:
    this._totalFatPerServing = 0
    this._totalFatUnit = 'g'
    this._totalFatRDA = 0
    this._saturatedFatPerServing = 0
    this._saturatedFatUnit = 'g'
    this._saturatedFatRDA = 0
    this._transFatPerServing = 0
    this._transFatUnit = 'g'
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = 0
    this._cholesterolUnit = 'mg'
    this._cholesterolRDA = 0
    this._sodium = 0
    this._sodiumUnit = 'mg'
    this._sodiumRDA = 0
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = 0
    this._totalCarbohydrateUnit = 'g'
    this._totalCarbohydrateRDA = 0
    this._dietaryFiber = 0
    this._dietaryFiberUnit = 'g'
    this._dietaryFiberRDA = 0
    this._sugars = 0
    this._sugarsUnit = 'g'
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = 0
    this._totalProteinUnit = 'g'
    //
    //   National Database Number
    this._ndbno = -1
  }

  // This constructor initializes a NutritionItem from the DB/JSON which
  // contains FDA data per 100g of ingredient.
  initializeSingle(key, tag, dataForKey) {
    this._key = key
    this._tag = tag

    const TODO = 0

    // Pull data from DB/JSON to initialize remainder of class instance:
    //
    //   Generic measures/Unit:
    this._servingAmount = 100
    this._servingUnit = 'g'
    this._calories = getFloatFromDB(dataForKey, 'kcal')
    // 9 calories per gram of fat:
    this._caloriesFromFat = 9 * getFloatFromDB(dataForKey, 'Fat')
    //
    //   Fat measures/metrics:
    this._totalFatPerServing = getFloatFromDB(dataForKey, 'Fat')
    this._totalFatUnit = 'g'
    this._totalFatRDA = 100.0 * this._totalFatPerServing / RDA2000Cal.totalFat
    this._saturatedFatPerServing = getFloatFromDB(dataForKey, 'SatFat')
    this._saturatedFatUnit = 'g'
    this._saturatedFatRDA = 100.0 * this._saturatedFatPerServing / RDA2000Cal.saturatedFat
    this._transFatPerServing = getFloatFromDB(dataForKey, 'TransFat')
    this._transFatUnit = 'g'
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = getFloatFromDB(dataForKey, 'Cholesterol')
    this._cholesterolUnit = 'mg'
    this._cholesterolRDA = 100.0 * this._cholesterol / RDA2000Cal.cholesterol
    this._sodium = getFloatFromDB(dataForKey, 'Sodium')
    this._sodiumUnit = 'mg'
    this._sodiumRDA = 100.0 * this._sodium / RDA2000Cal.sodium
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = getFloatFromDB(dataForKey, 'Carbohydrate')
    this._totalCarbohydrateUnit = 'g'
    this._totalCarbohydrateRDA = 100.0 * this._totalCarbohydratePerServing / RDA2000Cal.carbohydrate
    this._dietaryFiber = getFloatFromDB(dataForKey, 'Fiber')
    this._dietaryFiberUnit = 'g'
    this._dietaryFiberRDA = 100.0 * this._dietaryFiber / RDA2000Cal.fiber
    this._sugars = getFloatFromDB(dataForKey, 'Sugar')
    this._sugarsUnit = 'g'
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = getFloatFromDB(dataForKey, 'Protein')
    this._totalProteinUnit = 'g'
    //
    //   National Database Number
    this._ndbno = parseInt(dataForKey['NDB'])
  }

  initializeComposite(ingredientTuples) {
    for (var key in ingredientTuples) {
      var ingredientTuple = ingredientTuples[key]
      const scaleFactor = ingredientTuple.getScale() / 100.0
      const ingredient = ingredientTuple.getIngredient()

      // TODO add remaining checks for serving unit compatibility or appropriate
      // conversions:

      // Add the ingredients together to get a composite label
      //
      //   Generic measures/Unit:
      this.throwIfUnitMismatch('serving size', this._servingUnit,
        ingredient._servingUnit, ingredient._tag, ingredient._key)
      // Only need this assingment on the first ingredient, but in a hurry ...
      this._servingUnit = ingredient._servingUnit
      this._servingAmount += ingredient._servingAmount * scaleFactor
      // TODO: pretty sure this works for calories (everything is linear
      // I believe). Need to confirm.
      this._calories += ingredient._calories * scaleFactor
      this._caloriesFromFat += ingredient._caloriesFromFat * scaleFactor
      //
      //   Fat measures/metrics:
      this.throwIfUnitMismatch('total fat', this._totalFatUnit,
        ingredient._totalFatUnit, ingredient._tag, ingredient._key)
      // Only need this assingment on the first ingredient, but in a hurry ...
      this._totalFatUnit = ingredient._totalFatUnit
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

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {Ingredient: this}
    return JSON.stringify(typeToInstance)
  }

  deserialize(typeToInstanceString) {
    // TODO:
  }

  setServingAmount() {
    // TODO: get the current serving amount and scale all the numbers appropriately
    // for the getter functions.
  }

  getServingAmount() {
    return (this._servingAmount * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getServingUnit() {
    return this._servingUnit
  }

  getCalories() {
    return (this._calories * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getCaloriesFromFat() {
    return (this._caloriesFromFat * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalFatPerServing() {
    return (this._totalFatPerServing * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalFatUnit() {
    return this._totalFatUnit
  }

  getTotalFatRDA() {
    return (this._totalFatRDA * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSaturatedFatPerServing() {
    return (this._saturatedFatPerServing * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSaturatedFatUnit() {
    return this._saturatedFatUnit
  }

  getSaturatedFatRDA() {
    return this._saturatedFatRDA.toFixed(this.decimalPlaces)
  }

  getTransFatPerServing() {
    return (this._transFatPerServing * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTransFatUnit() {
    return this._transFatUnit
  }

  getCholestorol() {
    return (this._cholesterol * this.scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getCholestorolUnit() {
    return this._cholesterolUnit
  }

  getCholestorolRDA() {
    return this._cholesterolRDA.toFixed(this.decimalPlaces)
  }

  getSodium() {
    return this._sodium.toFixed(this.decimalPlaces)
  }

  getSodumUnit() {
    return this._sodiumUnit
  }

  getSodiumRDA() {
    return this._sodiumRDA.toFixed(this.decimalPlaces)
  }

  getTotalCarbohydratePerServing() {
    return this._totalCarbohydratePerServing.toFixed(this.decimalPlaces)
  }

  getTotalCarbohydrateUnit() {
    return this._totalCarbohydrateUnit
  }

  getTotalCarbohydrateRDA() {
    return this._totalCarbohydrateRDA.toFixed(this.decimalPlaces)
  }

  getDietaryFiber() {
    return this._dietaryFiber.toFixed(this.decimalPlaces)
  }

  getDietaryFiberUnit() {
    return this._dietaryFiberUnit
  }

  getDietaryFiberRDA() {
    return this._dietaryFiberRDA.toFixed(this.decimalPlaces)
  }

  getSugars() {
    return this._sugars.toFixed(this.decimalPlaces)
  }

  getSugarsUnit() {
    return this._sugarsUnit
  }

  getTotalProteinPerServing() {
    return this._totalProteinPerServing.toFixed(this.decimalPlaces)
  }

  getTotalProteinUnit() {
    return this._totalProteinUnit
  }

  throwIfUnitMismatch(category, mainUnit, otherUnit, otherTag, otherKey) {
    if (mainUnit != undefined) {
      if (mainUnit != otherUnit) {
        throw "Ingredient " + otherTag + "(" + otherKey
              + ") uses different Unit, " + otherUnit
              + ", from other ingredients: " + mainUnit + " "
              + category + "."
      }
    }
  }
}
