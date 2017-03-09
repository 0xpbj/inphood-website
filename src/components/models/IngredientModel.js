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

function throwIfUnitMismatch(category, mainUnit, otherUnit, otherTag, otherKey) {
  if (mainUnit != undefined) {
    if (mainUnit != otherUnit) {
      throw "Ingredient " + otherTag + "(" + otherKey
            + ") uses different Unit, " + otherUnit
            + ", from other ingredients: " + mainUnit + " "
            + category + "."
    }
  }
}

function throwIfUnexpectedUnit(metric, expectedUnit, actualUnit) {
  if (expectedUnit !== actualUnit) {
    throw 'Unexpected ' + metric
          + ' unit: ' + actualUnit + ' (expected ' + expectedUnit + ')'
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

export class IngredientModel {
  constructor() {
    this.decimalPlaces = 2

    this._scaleGettersTo = 1.0

    this._suggestedServingAmount = 0
    this._suggestedServingUnit = 'g'

    //
    // Display units & unit count (i.e. 2 tacos)
    // WARNING: not included in original serialization (must check if object has
    // these when read from serialization).
    this._displayServingCount = 1
    this._displayServingUnit = 'serving'

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
    //
    //   Measures & conversions:
    //
    //     The format of _measureString:
    //        <quantity> <unit> [<meta>]
    //     Examples:
    //        "0.25 cup"
    //        "0.33 package (10 oz)"
    //        "1.0 NLEA serving"
    //
    //     _measureQuantity = <quantity>
    //     _measureUnit = <unit>
    //     _measureMeta = <meta>
    this._measureWeight_g = 0
    this._measureString = ''
    this._measureQuantity = 0
    this._measureUnit = ''
    this._measureMeta = ''
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
    //
    //   Measures & conversions: (see more documentation above in constructor)
    this._measureWeight_g = parseFloat(dataForKey['Weight(g)'])
    this._measureString = dataForKey['Measure']
    this.setMeasurePropsFromString(this._measureString)

    this.setServingAmount(100,
                          'g',
                          this._displayServingCount,
                          this._displayServingUnit)
  }

  initializeComposite(scaledIngredients) {
    // console.log('initializeComposite ------------------------------------------');
    for (var key in scaledIngredients) {
      var scaledIngredient = scaledIngredients[key]
      const scaleFactor = scaledIngredient.getScale()
      const ingredient = scaledIngredient.getIngredientModel()

      // TODO add remaining checks for serving unit compatibility or appropriate
      // conversions:

      // Add the ingredients together to get a composite label
      //
      //   Generic measures/Unit:
      throwIfUnitMismatch('serving size', this._servingUnit,
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
      throwIfUnitMismatch('total fat', this._totalFatUnit,
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

      // console.log('   ' + key);
      // console.log('   scaleFactor:          ' + scaleFactor);
      // console.log('   ingredient._calories: ' + ingredient._calories);
      // console.log('   total calories:       ' + this._calories);
      // console.log('   total mass(g):        ' + this._servingAmount + this._servingUnit);
    }
  }

  initializeFromSerialization(serializedData) {
    let ingredientData = serializedData.Ingredient

    this._key = ingredientData._key
    this._tag = ingredientData._tag

    // Pull data from DB/JSON to initialize remainder of class instance:
    //
    //   Generic measures/Unit:
    this._servingAmount = ingredientData._servingAmount
    this._servingUnit = ingredientData._servingUnit
    this._calories = ingredientData._calories
    // Display Unit/Servings (i.e. 2 tacos) -- added after items were serialized,
    // hence check for hasOwnProperty:
    if (ingredientData.hasOwnProperty('_displayServingCount') &&
        ingredientData.hasOwnProperty('_displayServingUnit')) {
      this._displayServingCount = ingredientData._displayServingCount
      this._displayServingUnit = ingredientData._displayServingUnit
    }
    // 9 calories per gram of fat:
    this._caloriesFromFat = ingredientData._caloriesFromFat
    //
    //   Fat measures/metrics:
    this._totalFatPerServing = ingredientData._totalFatPerServing
    this._totalFatUnit = ingredientData._totalFatUnit
    this._totalFatRDA = ingredientData._totalFatRDA
    this._saturatedFatPerServing = ingredientData._saturatedFatPerServing
    this._saturatedFatUnit = ingredientData._saturatedFatUnit
    this._saturatedFatRDA = ingredientData._saturatedFatRDA
    this._transFatPerServing = ingredientData._transFatPerServing
    this._transFatUnit = ingredientData._transFatUnit
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = ingredientData._cholesterol
    this._cholesterolUnit = ingredientData._cholesterolUnit
    this._cholesterolRDA = ingredientData._cholesterolRDA
    this._sodium = ingredientData._sodium
    this._sodiumUnit = ingredientData._sodiumUnit
    this._sodiumRDA = ingredientData._sodiumRDA
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = ingredientData._totalCarbohydratePerServing
    this._totalCarbohydrateUnit = ingredientData._totalCarbohydrateUnit
    this._totalCarbohydrateRDA = ingredientData._totalCarbohydrateRDA
    this._dietaryFiber = ingredientData._dietaryFiber
    this._dietaryFiberUnit = ingredientData._dietaryFiberUnit
    this._dietaryFiberRDA = ingredientData._dietaryFiberRDA
    this._sugars = ingredientData._sugars
    this._sugarsUnit = ingredientData._sugarsUnit
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = ingredientData._totalProteinPerServing
    this._totalProteinUnit = ingredientData._totalProteinUnit
    //
    //   National Database Number
    this._ndbno = ingredientData._ndbno
    //
    //   Measures & conversions: (see more documentation above in constructor)
    this._measureWeight_g = ingredientData._measureWeight_g
    this._measureString = ingredientData._measureString
    this._measureQuantity = ingredientData._measureQuantity
    this._measureUnit = ingredientData._measureUnit
    this._measureMeta = ingredientData._measureMeta

    // sets member var and also scale factor
    // (using the this values here b/c they've been vetted above with hasOwnProperty)
    this.setServingAmount(ingredientData._suggestedServingAmount,
                          ingredientData._suggestedServingUnit,
                          this._displayServingCount,
                          this._displayServingUnit)
  }

  initializeFromBrandedFdaObj(foodObject) {
    if (!(foodObject.hasOwnProperty('desc')
          && foodObject.desc.hasOwnProperty('ndbno'))) {
      throw 'Unable to execute IngredientModel.initializeFromBrandedFdaObj. No ndbno data.'
    }
    this._ndbno = foodObject.desc.ndbno

    // Initialize key metrics to NaN to prevent composite calculations from being
    // done where data is unknown (i.e. 6 + unknown = unknown  or  NaN so we can
    // exclude these metrics from the label):
    //
    //   Generic measures/Unit:
    this._servingAmount = 100
    this._calories = NaN
    this._caloriesFromFat = NaN
    //
    //   Fat measures/metrics:
    this._totalFatPerServing = NaN
    this._totalFatRDA = NaN
    this._saturatedFatPerServing = NaN
    this._saturatedFatRDA = NaN
    this._transFatPerServing = NaN
    //
    //   Cholesterol & Sodium measures/metrics:
    this._cholesterol = NaN
    this._cholesterolRDA = NaN
    this._sodium = NaN
    this._sodiumRDA = NaN
    //
    //   Carbohydrate measures/metrics:
    this._totalCarbohydratePerServing = NaN
    this._totalCarbohydrateRDA = NaN
    this._dietaryFiber = NaN
    this._dietaryFiberRDA = NaN
    this._sugars = NaN
    //
    //   Protein measures/metrics:
    this._totalProteinPerServing = NaN

    if (!foodObject.hasOwnProperty('nutrients')) {
      throw 'Unable to execute IngredientModel.initializeFromBrandedFdaObj. No nutritent data.'
    }
    const nutrients = foodObject.nutrients
    for (let j = 0; j < nutrients.length; j++) {
      const nutrient = nutrients[j]

      if (!(nutrient.hasOwnProperty('name')
            && nutrient.hasOwnProperty('unit')
            && nutrient.hasOwnProperty('value'))) {
        continue
      }

      // The following values should be per 100g
      const nName = nutrient.name
      const nUnit = nutrient.unit
      const nValue = nutrient.value

      switch(nName) {
        case "Energy":
          throwIfUnexpectedUnit("Energy", "kcal", nUnit)
          this._calories = nValue
          break
        case "Protein":
          throwIfUnexpectedUnit("Protein", "g", nUnit)
          this._totalProteinPerServing = nValue
          break
        case "Total lipid (fat)":
          throwIfUnexpectedUnit("Total lipid (fat)", "g", nUnit)
          this._totalFatPerServing = nValue
          this._totalFatRDA = 100.0 * this._totalFatPerServing / RDA2000Cal.totalFat
          this._caloriesFromFat = 9 * this._totalFatPerServing
          break
        case "Carbohydrate, by difference":
          throwIfUnexpectedUnit("Carbohydrate, by difference", "g", nUnit)
          this._totalCarbohydratePerServing = nValue
          this._totalCarbohydrateRDA = 100.0 * this._totalCarbohydratePerServing / RDA2000Cal.carbohydrate
          break
        case "Fiber, total dietary":
          throwIfUnexpectedUnit("Fiber, total dietary", "g", nUnit)
          this._dietaryFiber = nValue
          this._dietaryFiberRDA = 100.0 * this._dietaryFiber / RDA2000Cal.fiber
          break
        case "Sodium, Na":
          throwIfUnexpectedUnit("Sodium, Na", "mg", nUnit)
          this._sodium = nValue
          this._sodiumRDA = 100.0 * this._sodium / RDA2000Cal.sodium
          break
        case "Sugars, total":
          throwIfUnexpectedUnit("Sugars, total", "g", nUnit)
          this._sugars = nValue
          break
        case "Fatty acids, total saturated":
          throwIfUnexpectedUnit("Fatty acids, total saturated", "g", nUnit)
          this._saturatedFatPerServing = nValue
          this._saturatedFatRDA = 100.0 * this._saturatedFatPerServing / RDA2000Cal.saturatedFat
          break
        case "Fatty acids, total trans":
          throwIfUnexpectedUnit("Fatty acids, total trans", "g", nUnit)
          this._transFatPerServing = nValue
          break
        case "Cholesterol":
          throwIfUnexpectedUnit("Cholesterol", "mg", nUnit)
          this._cholesterol = nValue
          this._cholesterolRDA = 100.0 * this._cholesterol / RDA2000Cal.cholesterol

        default:
      }
      // TODO:
      // if (!foodObject.hasOwnProperty('measures')) {
      //   const measures = nutrient.measures
      //   for (let k = 0; k < measures.length; k++) {
      //     const measure = measures[k]
      //   }
      // }
    }
  }

  serialize() {
    // Serialize nutritionModel for firebase storage
    var typeToInstance = {Ingredient: this}
    return JSON.stringify(typeToInstance)
  }

  setServingAmount(suggestedServingAmount,
                   suggestedServingUnit,
                   displayServingCount,
                   displayServingUnit) {

    this._suggestedServingAmount = suggestedServingAmount
    this._suggestedServingUnit = suggestedServingUnit

    this._displayServingCount = displayServingCount
    this._displayServingUnit = displayServingUnit

    // TODO:
    if (suggestedServingUnit === 'people') {
      this._scaleGettersTo = 1 / suggestedServingAmount
    } else {
      this._scaleGettersTo = suggestedServingAmount / this._servingAmount
    }
  }

  setMeasurePropsFromString(aMeasureString) {
    if (aMeasureString === undefined || aMeasureString === "") {
      return
    }

    let textArr = aMeasureString.split(' ')
    if (textArr.length >= 1) {
        this._measureQuantity = parseFloat(textArr[0])
    }
    if (textArr.length >= 2) {
        this._measureUnit += textArr[1].replace(/(,|\s)/g, '')
    }
    if (textArr.length >= 3) {
    	let meta = ""
    	for (let token = 2; token < textArr.length; token++) {
        	meta += textArr[token]
            meta += " "
        }
        this._measureMeta = meta.trim()
    }
    return
  }

  getKey() {
    return this._key
  }

  getServingAmount() {
    return (this._servingAmount * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getUnscaledServingAmount() {
    return this._servingAmount.toFixed(this.decimalPlaces)
  }

  getServingUnit() {
    return this._servingUnit
  }

  getSuggestedServingAmount() {
    return this._suggestedServingAmount
  }

  getSuggestedServingUnit() {
    return this._suggestedServingUnit
  }

  setDisplayServingCount(aDisplayServingCount) {
    this._displayServingCount = aDisplayServingCount
  }

  getDisplayServingCount() {
    return this._displayServingCount
  }

  setDisplayServingUnit(aDisplayServingUnit) {
    this._displayServingUnit = aDisplayServingUnit
  }

  getDisplayServingUnit() {
    return this._displayServingUnit
  }

  getCalories() {
    return (this._calories * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getCaloriesFromFat() {
    return (this._caloriesFromFat * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalFatPerServing() {
    return (this._totalFatPerServing * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalFatUnit() {
    return this._totalFatUnit
  }

  getTotalFatRDA() {
    return (this._totalFatRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSaturatedFatPerServing() {
    return (this._saturatedFatPerServing * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSaturatedFatUnit() {
    return this._saturatedFatUnit
  }

  getSaturatedFatRDA() {
    return (this._saturatedFatRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTransFatPerServing() {
    return (this._transFatPerServing * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTransFatUnit() {
    return this._transFatUnit
  }

  getCholestorol() {
    return (this._cholesterol * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getCholestorolUnit() {
    return this._cholesterolUnit
  }

  getCholestorolRDA() {
    return (this._cholesterolRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSodium() {
    return (this._sodium * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSodumUnit() {
    return this._sodiumUnit
  }

  getSodiumRDA() {
    return (this._sodiumRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalCarbohydratePerServing() {
    return (this._totalCarbohydratePerServing * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalCarbohydrateUnit() {
    return this._totalCarbohydrateUnit
  }

  getTotalCarbohydrateRDA() {
    return (this._totalCarbohydrateRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getDietaryFiber() {
    return (this._dietaryFiber * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getDietaryFiberUnit() {
    return this._dietaryFiberUnit
  }

  getDietaryFiberRDA() {
    return (this._dietaryFiberRDA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSugars() {
    return (this._sugars  * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getSugarsUnit() {
    return this._sugarsUnit
  }

  getTotalProteinPerServing() {
    return (this._totalProteinPerServing  * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  getTotalProteinUnit() {
    return this._totalProteinUnit
  }

  getMeasureWeightGrams() {
    return this._measureWeight_g
  }

  getMeasureQuantity() {
    return this._measureQuantity
  }

  getMeasureUnit() {
    return this._measureUnit
  }

  getMeasureMeta() {
    return this._measureMeta
  }
}
