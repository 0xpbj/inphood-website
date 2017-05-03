// The FDA DB sometimes has values of '--' for nutrition metrics, this method
// converts those to 0.0.  If the value is not '--', this method parses the
// FDA value to a float and returns it.
//
function getFloatFromDB(dataForKey, key) {
  if (! key in dataForKey)
    return 0.0

  const field = dataForKey[key]
  return ((field === '--') ? 0.0 : parseFloat(field))
}

function throwIfUnitMismatch(category, mainUnit, otherUnit, otherTag, otherKey) {
  if (mainUnit != undefined) {
    if (mainUnit != otherUnit) {
      throw new Error(
            "Ingredient " + otherTag + "(" + otherKey
            + ") uses different Unit, " + otherUnit
            + ", from other ingredients: " + mainUnit + " "
            + category + ".")
    }
  }
}

function throwIfUnexpectedUnit(metric, expectedUnit, actualUnit) {
  if (expectedUnit !== actualUnit) {
    throw new Error(
          'Unexpected ' + metric
          + ' unit: ' + actualUnit + ' (expected ' + expectedUnit + ')')
  }
}

function bothDefined(obj1, obj2) {
  return ((obj1 !== undefined) && (obj2 !== undefined))
}

// The following methods are to support FDA guidelines for rounding values
// on food labels. See:
//   - https://www.fda.gov/Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation/LabelingNutrition/ucm064932.htm
//
function snapTo(value, snapScale) {
  const scaledValue = value / snapScale
  const wholePortion = Math.trunc(scaledValue)

  let snappedValue = wholePortion * snapScale

  const remainingPortion = value - snappedValue
  if (remainingPortion < (snapScale/2.0)) {
    return snappedValue
  }
  return snappedValue + snapScale
}
//
//  Calories, Calories from Fat, Calories from Saturated Fat:
function getFdaRoundedCalories(value) {
  if (value < 5.0) {
    return 0
  } else if (value < 50.0) {
    return snapTo(value, 5)
  }
  return snapTo(value, 10)
}
//
// Total Fat, Saturated Fat, Trans Fat, Polyunsaturated Fat, Monounsaturated Fat:
function getFdaRoundedFats(value) {
  if (value < 0.5) {
    return 0
  } else if (value < 5.0) {
    return snapTo(value, 0.5)
  }
  return snapTo(value, 1)
}
//
// Cholestrol:
function getFdaRoundedCholesterol(value) {
  if (value < 2.0) {
    return 0
  } else if (value <= 5.0) {
    return 'less than 5'
  }
  return snapTo(value, 5)
}
//
// Sodium, Potassium
function getFdaRoundedNaK(value) {
  if (value < 5.0) {
    return 0
  } else if (value <= 140.0) {
    return snapTo(value, 5)
  }
  return snapTo(value, 10)
}
//
// Total Carbohydrate, Dietary Fiber, Sugars:
function getFdaRoundedCarbFiberSugar(value) {
  if (value < 0.5) {
    return 0
  } else if (value < 1.0) {
    return 'less than 1'
  }
  return snapTo(value, 1)
}
//
// Protein
function getFdaRoundedProtein(value) {
  if (value < 0.5) {
    return 0
  } else if (value < 1.0) {
    return 'less than 1'
  }
  return snapTo(value, 1)
}
//
// RDA for non vitamins and non minerals
function getFdaRoundedRDA(value) {
  return Math.round(value).toFixed(0)
}
//
// RDA for vitamins and minerals
function getFdaRoundedRDAVitAndMin(value) {
  if (value <= 1.0) {
    return 0
  } else if (value <= 2.0) {
    return 2
  } else if (value <= 10.0) {
    return snapTo(value, 2)
  } else if (value <= 50.0) {
    return snapTo(value, 5)
  }
  return snapTo(value, 10)
}
//
// Beta-Carotene (Vitamin A)
function getFdaRoundedRDAVitaminA(value) {
  if (value <= 10.0) {
    return snapTo(value, 2)
  } else if (value <= 50.0) {
    return snapTo(value, 5)
  }
  return snapTo(value, 10)
}


function isRoundingStyleFda(aRoundingStyle) {
  return (aRoundingStyle === 'fda')
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

    this._displayServingRatio = 'Recipe, About'

    this._suggestedServingsLines = undefined
    //
    //   Generic measures/Unit:
    this._servingAmount = 1
    this._servingUnit = 'g'
    //
    // This value calculated from fat (lipid) data:
    this._caloriesFromFat = 0
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

    // Persist the type of label in the composite ingredient model.
    // Valid label types include:
    //    - standard
    //    - complete
    //    - micronut
    //    - sugarmicro
    //    - text
    //    - personal
    //
    this._labelType = ''

    this._roundingStyle = 'fda'

    // The following loop creates all the boilerplate/data-driven
    // member variables for this class.
    //
    //   TODO: thoughts to improve this:
    //           - do we really need the units and to store the units for
    //             each nutrient? (you could make an assumption about
    //             similarity and perform a static check?)
    //
    const nutrientMembers = IngredientModel.nutrientMembers
    for (let member in nutrientMembers) {
      const nutrientMember = nutrientMembers[member]

      this[member] = 0
      if (bothDefined(nutrientMember.unitMember, nutrientMember.unit)) {
        this[nutrientMember.unitMember] = nutrientMember.unit
      }
      if (bothDefined(nutrientMember.rdaMember, nutrientMember.rda2k)) {
        this[nutrientMember.rdaMember] = 0
      }
      this[nutrientMember.visibleMember] = true
    }
  }

  // This constructor initializes a NutritionItem from the DB/JSON which
  // contains FDA data per 100g of ingredient.
  initializeSingle(key, tag, dataForKey) {
    this._key = key
    this._tag = tag

    // Pull data from DB/JSON to initialize remainder of class instance:
    //
    //   Generic measures/Unit:
    this._servingAmount = 100
    this._servingUnit = 'g'
    //
    // 9 calories per gram of fat:
    this._caloriesFromFat = 9 * getFloatFromDB(
      dataForKey,
      IngredientModel.nutrientMembers['_totalFatPerServing'].firebaseKey)
    //
    //   National Database Number
    this._ndbno = parseInt(dataForKey['NDB'])
    this._longNdbno = dataForKey['NDB']
    //
    //   Measures & conversions: (see more documentation above in constructor)
    this._measureWeight_g = parseFloat(dataForKey['Weight(g)'])
    this._measureString = dataForKey['Measure']
    this.setMeasurePropsFromString(this._measureString)
    //
    // Nutrients:
    const nutrientMembers = IngredientModel.nutrientMembers
    for (let member in nutrientMembers) {
        const nutrientMember = nutrientMembers[member]

        this[member] = getFloatFromDB(dataForKey, nutrientMember.firebaseKey)
        if (bothDefined(nutrientMember.unitMember, nutrientMember.unit)) {
          this[nutrientMember.unitMember] = nutrientMember.unit
        }
        if (bothDefined(nutrientMember.rdaMember, nutrientMember.rda2k)) {
          this[nutrientMember.rdaMember] = 100.0 * this[member] / nutrientMember.rda2k
        }

        this[nutrientMember.visibleMember] = true
    }

    this.setServingAmount(
      100, 'g', this._displayServingCount, this._displayServingUnit, this._displayServingRatio)
  }

  initializeComposite(scaledIngredients) {
    this._servingAmount = 0
    this._servingUnit = 'g'

    // console.log('initializeComposite ------------------------------------------');
    for (var key in scaledIngredients) {
      var scaledIngredient = scaledIngredients[key]
      const scaleFactor = scaledIngredient.getScale()
      const ingredient = scaledIngredient.getIngredientModel()

      // Add the ingredients together to get a composite label
      //
      //   Generic measures/Unit:
      throwIfUnitMismatch('serving size', this._servingUnit,
        ingredient._servingUnit, ingredient._tag, ingredient._key)
      // Only need this assingment on the first ingredient, but in a hurry ...
      this._servingUnit = ingredient._servingUnit
      this._servingAmount += ingredient._servingAmount * scaleFactor
      this._caloriesFromFat += ingredient._caloriesFromFat * scaleFactor

      //
      //  Nutrients:
      const nutrientMembers = IngredientModel.nutrientMembers
      for (let member in nutrientMembers) {
        const nutrientMember = nutrientMembers[member]

        if (bothDefined(nutrientMember.unitMember, nutrientMember.unit)) {
          // TODO: not sure if this check makes sense--it's comparing the unit
          //       provided in the constructor against the one being added--maybe
          //       the check makes sense but the assingment below does not?
          throwIfUnitMismatch(member,
                              this[nutrientMember.unitMember],
                              ingredient[nutrientMember.unitMember],
                              ingredient._tag,
                              ingredient._key)
          this[nutrientMember.unitMember] = ingredient[nutrientMember.unitMember]
        }
        this[member] += ingredient[member] * scaleFactor
        if (bothDefined(nutrientMember.rdaMember, nutrientMember.rda2k)) {
          this[nutrientMember.rdaMember] +=
            ingredient[nutrientMember.rdaMember] * scaleFactor
        }
      }
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

    // Display Unit/Servings (i.e. 2 tacos) -- added after items were serialized,
    // hence check for hasOwnProperty:
    if (ingredientData.hasOwnProperty('_displayServingCount') &&
        ingredientData.hasOwnProperty('_displayServingUnit')) {
      this._displayServingCount = ingredientData._displayServingCount
      this._displayServingUnit = ingredientData._displayServingUnit
    }
    if (ingredientData.hasOwnProperty('_displayServingRatio')) {
      this._displayServingRatio = ingredientData._displayServingRatio
    }
    if (ingredientData.hasOwnProperty('_suggestedServingsLines')) {
      this._suggestedServingsLines = ingredientData._suggestedServingsLines
    }
    // 9 calories per gram of fat:
    this._caloriesFromFat = ingredientData._caloriesFromFat
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
    //
    // Label Type
    this._labelType = IngredientModel.labelTypes.standard
    if (ingredientData.hasOwnProperty('_labelType')) {
      this._labelType = ingredientData._labelType
    }
    //
    // Rounding style
    this._roundingStyle = 'fda'
    if (ingredientData.hasOwnProperty('_roundingStyle')) {
      this._roundingStyle = ingredientData._roundingStyle
    }
    //
    // Nutrients
    const nutrientMembers = IngredientModel.nutrientMembers
    for (let member in nutrientMembers) {
      const nutrientMember = nutrientMembers[member]

      if (! ingredientData.hasOwnProperty(member)) {
        // Go with the constructor values
        // TODO: in future, might want to use NDBNO to look this up (poses problems
        //       for label.inphood package size & performance; would also want to
        //       re-serialize)
        continue
      }

      this[member] = ingredientData[member]
      if (bothDefined(nutrientMember.unitMember, nutrientMember.unit)) {
        this[nutrientMember.unitMember] =
          ingredientData[nutrientMember.unitMember]
      }
      if (bothDefined(nutrientMember.rdaMember, nutrientMember.rda2k)) {
        this[nutrientMember.rdaMember] =
          ingredientData[nutrientMember.rdaMember]
      }
    }

    // sets member var and also scale factor
    // (using the this values here b/c they've been vetted above with hasOwnProperty)
    this.setServingAmount(ingredientData._suggestedServingAmount,
                          ingredientData._suggestedServingUnit,
                          this._displayServingCount,
                          this._displayServingUnit,
                          this._displayServingRatio)
  }

  initializeFromBrandedFdaObj(description, searchTerm, foodObject) {
    if (!(foodObject.hasOwnProperty('desc')
          && foodObject.desc.hasOwnProperty('ndbno'))) {
      throw new Error('Unable to execute IngredientModel.initializeFromBrandedFdaObj. No ndbno data.')
    }
    this._ndbno = foodObject.desc.ndbno

    this._key = description
    this._tag = searchTerm

    //   Generic measures/Unit:
    this._servingAmount = 100

    if (!foodObject.hasOwnProperty('nutrients')) {
      throw new Error('Unable to execute IngredientModel.initializeFromBrandedFdaObj. No nutritent data.')
    }
    for (let nutrient of foodObject.nutrients) {
      if (!(nutrient.hasOwnProperty('name')
            && nutrient.hasOwnProperty('unit')
            && nutrient.hasOwnProperty('value'))) {
        continue
      }

      // The following values should be per 100g
      const nName = nutrient.name
      const nUnit = nutrient.unit
      const nValue = nutrient.value

      // TODO: combine these
      // Nutrients:
      //    Check to see if nName is in the nutrientKey values of the
      //    IngredientModel.nutrientMembers:
      const nutrientMembers = IngredientModel.nutrientMembers
      for (let member in nutrientMembers) {
        const nutrientMember = nutrientMembers[member]

        if (nName === nutrientMember.nutrientKey) {
          // TODO: what if they're not both defined?
          if (bothDefined(nutrientMember.unitMember, nutrientMember.unit)) {
            throwIfUnexpectedUnit(nName, nutrientMember.unit, nUnit)
          }
          this[member] = nValue
          if (bothDefined(nutrientMember.rdaMember, nutrientMember.rda2k)) {
            this[nutrientMember.rdaMember] = 100 * nValue / nutrientMember.rda2k
          }
          break
        }
      }

      // The FDA Branded database has an array of nutrients for each food item.
      // Within this array is another array of measurements for each nutrient.
      // We need to add support for this to support alternate measurements, like
      // 'crackers' or 'fl-oz'.
      //
      //  Here is a sample of the format for Mary's gone crackers:
      //
      // nutrients : Array[17]
      //   0 : Object
      //     group : "Proximates"
      //     measures : Array[1]
      //       0 : Object
      //         eqv : 30
      //         eunit : "g"
      //         label : "g"
      //         qty : 30
      //         value : "140"
      //     length : 1
      //   name : "Energy"
      //   nutrient_id : "208"
      //   unit : "kcal"
      //   value : "467"
      //
      // TODO: support this in MVP5 or greater. (Look at some of the crackers
      //       data)
      //
      // Workaround: for now we'll just set _measureQuantity and _measureUnit to
      //             workout to 100g.
      this._measureQuantity = 100
      this._measureUnit = 'g'
      this._measureWeight_g = 100
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
                   displayServingUnit,
                   displayServingRatio) {

    this._suggestedServingAmount = suggestedServingAmount
    this._suggestedServingUnit = suggestedServingUnit

    this._displayServingCount = displayServingCount
    this._displayServingUnit = displayServingUnit

    this._displayServingRatio = displayServingRatio

    // TODO:
    if (suggestedServingUnit === 'people') {
      this._scaleGettersTo = 1 / suggestedServingAmount
    } else {
      // Workaround for initializeComposite--_servingAmount is zero in that method,
      // which causes _scaleGettersTo to get to Infinity and make the label show NaN
      if (this._servingAmount === 0) {
        this._scaleGettersTo = 0
      } else {
        this._scaleGettersTo = suggestedServingAmount / this._servingAmount
      }
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

  // Private methods - do not call outside of this class
  //
  _getScaledRoundedCalories(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedCalories(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  //
  _getScaledRoundedFat(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedFats(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  //
  _getScaledRoundedNaK(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedNaK(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  //
  _getScaledRoundedCarbFiberSugar(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedCarbFiberSugar(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  //
  _getScaledRoundedRDA(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedRDA(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  // Gets a scaled, possibly rounded (depends on this._roundingStyle), vitamin
  // or mineral RDA
  _getScaledRoundedVitMinRDA(aValue) {
    const scaledValue = aValue * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedRDAVitAndMin(scaledValue)
    }
    return scaledValue.toFixed(this.decimalPlaces)
  }
  // End Private methods

  getNdbno() {
    return this._longNdbno
  }

  getKey() {
    return this._key
  }

  getTag() {
    return this._tag
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

  setDisplayServingRatio(aDisplayServingRatio) {
    this._displayServingRatio = aDisplayServingRatio
  }

  getDisplayServingRatio() {
    return this._displayServingRatio
  }

  setSuggestedServingsLines(suggestedServingsLines) {
    this._suggestedServingsLines = suggestedServingsLines
  }

  getSuggestedServingsLines() {
    return this._suggestedServingsLines
  }

  setLabelType(aLabelType) {
    this._labelType = aLabelType
  }

  getLabelType() {
    return this._labelType
  }

  setRoundingStyle(aRoundingStyle) {
    this._roundingStyle = aRoundingStyle
  }

  getRoundingStyle() {
    return this._roundingStyle
  }

  getCalories() {
    return this._getScaledRoundedCalories(this._calories)
  }

  getCaloriesFromFat() {
    return this._getScaledRoundedCalories(this._caloriesFromFat)
  }

  getTotalFatPerServing() {
    return this._getScaledRoundedFat(this._totalFatPerServing)
  }

  getTotalFatUnit() {
    return this._totalFatUnit
  }

  getTotalFatRDA() {
    return this._getScaledRoundedRDA(this._totalFatRDA)
  }

  getSaturatedFatPerServing() {
    return this._getScaledRoundedFat(this._saturatedFatPerServing)
  }

  getSaturatedFatUnit() {
    return this._saturatedFatUnit
  }

  getSaturatedFatRDA() {
    return this._getScaledRoundedRDA(this._saturatedFatRDA)
  }

  getTransFatPerServing() {
    return this._getScaledRoundedFat(this._transFatPerServing)
  }

  getTransFatUnit() {
    return this._transFatUnit
  }

  getCholestorol() {
    const scaledCholesterol = this._cholesterol * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedCholesterol(scaledCholesterol)
    }
    return scaledCholesterol.toFixed(this.decimalPlaces)
  }

  getCholestorolUnit() {
    return this._cholesterolUnit
  }

  getCholestorolRDA() {
    return this._getScaledRoundedRDA(this._cholesterolRDA)
  }

  getSodium() {
    return this._getScaledRoundedNaK(this._sodium)
  }

  getSodiumUnit() {
    return this._sodiumUnit
  }

  getSodiumRDA() {
    return this._getScaledRoundedVitMinRDA(this._sodiumRDA)
  }

  getTotalCarbohydratePerServing() {
    return this._getScaledRoundedCarbFiberSugar(this._totalCarbohydratePerServing)
  }

  getTotalCarbohydrateUnit() {
    return this._totalCarbohydrateUnit
  }

  getTotalCarbohydrateRDA() {
    return this._getScaledRoundedRDA(this._totalCarbohydrateRDA)
  }

  getDietaryFiber() {
    return this._getScaledRoundedCarbFiberSugar(this._dietaryFiber)
  }

  getDietaryFiberUnit() {
    return this._dietaryFiberUnit
  }

  getDietaryFiberRDA() {
    return this._getScaledRoundedRDA(this._dietaryFiberRDA)
  }

  getSugars() {
    return this._getScaledRoundedCarbFiberSugar(this._sugars)
  }

  getSugarsUnit() {
    return this._sugarsUnit
  }

  getTotalProteinPerServing() {
    const scaledProtein = this._totalProteinPerServing * this._scaleGettersTo
    if (isRoundingStyleFda(this._roundingStyle)) {
      return getFdaRoundedProtein(scaledProtein)
    }
    return scaledProtein.toFixed(this.decimalPlaces)
  }

  getTotalProteinUnit() {
    return this._totalProteinUnit
  }

  get_vitaminB12() {
    return (this._vitaminB12 * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminB12Unit() {
    return this._vitaminB12Unit
  }

  get_vitaminB12RDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminB12RDA)
  }

  get_vitaminB12Visible() {
    return this._vitaminB12Visible
  }

  get_calcium() {
    return (this._calcium * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_calciumUnit() {
    return this._calciumUnit
  }

  get_calciumRDA() {
    return this._getScaledRoundedVitMinRDA(this._calciumRDA)
  }

  get_calciumVisible() {
    return this._calciumVisible
  }

  get_iron() {
    return (this._iron * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_ironUnit() {
    return this._ironUnit
  }

  get_ironRDA() {
    return this._getScaledRoundedVitMinRDA(this._ironRDA)
  }

  get_ironVisible() {
    return this._ironVisible
  }

  get_vitaminE() {
    return (this._vitaminE * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminEUnit() {
    return this._vitaminEUnit
  }

  get_vitaminERDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminERDA)
  }

  get_vitaminEVisible() {
    return this._vitaminEVisible
  }

  get_vitaminD() {
    return (this._vitaminD * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminDUnit() {
    return this._vitaminDUnit
  }

  get_vitaminDRDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminDRDA)
  }

  get_vitaminDVisible() {
    return this._vitaminDVisible
  }

  get_niacinB3() {
    return (this._niacinB3 * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_niacinB3Unit() {
    return this._niacinB3Unit
  }

  get_niacinB3RDA() {
    return this._getScaledRoundedVitMinRDA(this._niacinB3RDA)
  }

  get_niacinB3Visible() {
    return this._niacinB3Visible
  }

  get_magnesium() {
    return (this._magnesium * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_magnesiumUnit() {
    return this._magnesiumUnit
  }

  get_magnesiumRDA() {
    return this._getScaledRoundedVitMinRDA(this._magnesiumRDA)
  }

  get_magnesiumVisible() {
    return this._magnesiumVisible
  }

  get_riboflavinB2() {
    return (this._riboflavinB2 * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_riboflavinB2Unit() {
    return this._riboflavinB2Unit
  }

  get_riboflavinB2RDA() {
    return this._getScaledRoundedVitMinRDA(this._riboflavinB2RDA)
  }

  get_riboflavinB2Visible() {
    return this._riboflavinB2Visible
  }

  get_phosphorus() {
    return (this._phosphorus * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_phosphorusUnit() {
    return this._phosphorusUnit
  }

  get_phosphorusRDA() {
    return this._getScaledRoundedVitMinRDA(this._phosphorusRDA)
  }

  get_phosphorusVisible() {
    return this._phosphorusVisible
  }

  get_zinc() {
    return (this._zinc * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_zincUnit() {
    return this._zincUnit
  }

  get_zincRDA() {
    return this._getScaledRoundedVitMinRDA(this._zincRDA)
  }

  get_zincVisible() {
    return this._zincVisible
  }

  get_folicAcid() {
    return (this._folicAcid * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_folicAcidUnit() {
    return this._folicAcidUnit
  }

  get_folicAcidRDA() {
    return this._getScaledRoundedVitMinRDA(this._folicAcidRDA)
  }

  get_folicAcidVisible() {
    return this._folicAcidVisible
  }

  get_vitaminB6() {
    return (this._vitaminB6 * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminB6Unit() {
    return this._vitaminB6Unit
  }

  get_vitaminB6RDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminB6RDA)
  }

  get_vitaminB6Visible() {
    return this._vitaminB6Visible
  }

  get_potassium() {
    return this._getScaledRoundedNaK(this._potassium)
  }

  get_potassiumUnit() {
    return this._potassiumUnit
  }

  get_potassiumRDA() {
    return this._getScaledRoundedVitMinRDA(this._potassiumRDA)
  }

  get_potassiumVisible() {
    return this._potassiumVisible
  }

  get_thiaminB1() {
    return (this._thiaminB1 * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_thiaminB1Unit() {
    return this._thiaminB1Unit
  }

  get_thiaminB1RDA() {
    return this._getScaledRoundedVitMinRDA(this._thiaminB1RDA)
  }

  get_thiaminB1Visible() {
    return this._thiaminB1Visible
  }

  get_vitaminC() {
    return (this._vitaminC * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminCUnit() {
    return this._vitaminCUnit
  }

  get_vitaminCRDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminCRDA)
  }

  get_vitaminCVisible() {
    return this._vitaminCVisible
  }

  get_vitaminK() {
    return (this._vitaminK * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminKUnit() {
    return this._vitaminKUnit
  }

  get_vitaminKRDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminKRDA)
  }

  get_vitaminKVisible() {
    return this._vitaminKVisible
  }

  get_vitaminA() {
    return (this._vitaminA * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminAUnit() {
    return this._vitaminAUnit
  }

  get_vitaminARDA() {
    return getFdaRoundedRDAVitaminA(this._vitaminARDA)
  }

  get_vitaminAVisible() {
    return this._vitaminAVisible
  }

  get_vitaminA_IU() {
    return (this._vitaminA_IU * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminA_IUUnit() {
    return this._vitaminA_IUUnit
  }

  get_vitaminA_IURDA() {
    return getFdaRoundedRDAVitaminA(this._vitaminA_IURDA)
  }

  get_vitaminA_IUVisible() {
    return this._vitaminA_IUVisible
  }

  get_vitaminD_IU() {
    return (this._vitaminD_IU * this._scaleGettersTo).toFixed(this.decimalPlaces)
  }

  get_vitaminD_IUUnit() {
    return this._vitaminD_IUUnit
  }

  get_vitaminD_IURDA() {
    return this._getScaledRoundedVitMinRDA(this._vitaminD_IURDA)
  }

  get_vitaminD_IUVisible() {
    return this._vitaminD_IUVisible
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

IngredientModel.labelTypes = {
  standard: 0,
  complete: 1,
  micronut: 2,
  sugarmic: 3,
  text:     4,
  personal: 5,
}

// rda2k from: https://www.dsld.nlm.nih.gov/dsld/dailyvalue.jsp
//  _vitaminA and _vitaminD do not feature in this b/c the site above uses IU instead
//  of ug/mg
// rda2k for _vitaminE was obtained from conversion described on (for natural form):
//  https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/
//
IngredientModel.nutrientMembers = {
  _calories : {
    unit: undefined,
    unitMember: undefined,
    rda2k: 2000,
    rdaMember: undefined,
    visibleMember: '_caloriesVisible',
    firebaseKey: 'kcal',
    nutrientKey: 'Energy'
  },
  _totalFatPerServing : {
    unit: 'g',
    unitMember: '_totalFatUnit',
    rda2k: 65,
    rdaMember: '_totalFatRDA',
    visibleMember: '_totalFatVisible',
    firebaseKey: 'Fat',
    nutrientKey: 'Total lipid (fat)'
  },
  _saturatedFatPerServing : {
    unit: 'g',
    unitMember: '_saturatedFatUnit',
    rda2k: 20,
    rdaMember: '_saturatedFatRDA',
    visibleMember: '_saturatedFatVisible',
    firebaseKey: 'SatFat',
    nutrientKey: 'Fatty acids, total saturated'
  },
  _transFatPerServing : {
    unit: 'g',
    unitMember: '_transFatUnit',
    rda2k: undefined,
    rdaMember: undefined,
    visibleMember: '_transFatVisible',
    firebaseKey: 'TransFat',
    nutrientKey: 'Fatty acids, total trans'
  },
  _polyunsatFat : {
    unit: 'g',
    unitMember: '_polyunsatFatUnit',
    rda2k: undefined,
    rdaMember: undefined,
    visibleMember: '_polyunsatFatVisible',
    firebaseKey: 'PolyunsatFat',
    nutrientKey: 'Fatty acids, total polyunsaturated'
  },
  _cholesterol : {
    unit: 'mg',
    unitMember: '_cholesterolUnit',
    rda2k: 300,
    rdaMember: '_cholesterolRDA',
    visibleMember: '_cholesterolVisible',
    firebaseKey: 'Cholesterol',
    nutrientKey: 'Cholesterol'
  },
  _sodium : {
    unit: 'mg',
    unitMember: '_sodiumUnit',
    rda2k: 2400,
    rdaMember: '_sodiumRDA',
    visibleMember: '_sodiumVisible',
    firebaseKey: 'Sodium',
    nutrientKey: 'Sodium, Na'
  },
  _totalCarbohydratePerServing : {
    unit: 'g',
    unitMember: '_totalCarbohydrateUnit',
    rda2k: 300,
    rdaMember: '_totalCarbohydrateRDA',
    visibleMember: '_totalCarbohydrateVisible',
    firebaseKey: 'Carbohydrate',
    nutrientKey: 'Carbohydrate, by difference'
  },
  _dietaryFiber : {
    unit: 'g',
    unitMember: '_dietaryFiberUnit',
    rda2k: 25,
    rdaMember: '_dietaryFiberRDA',
    visibleMember: '_dietaryFiberVisible',
    firebaseKey: 'Fiber',
    nutrientKey: 'Fiber, total dietary'
  },
  _sugars : {
    unit: 'g',
    unitMember: '_sugarsUnit',
    rda2k: undefined,
    rdaMember: undefined,
    visibleMember: '_sugarsVisible',
    firebaseKey: 'Sugar',
    nutrientKey: 'Sugars, total'
  },
  _totalProteinPerServing : {
    unit: 'g',
    unitMember: '_totalProteinUnit',
    rda2k: 50,
    rdaMember: undefined,
    visibleMember: '_totalProteinVisible',
    firebaseKey: 'Protein',
    nutrientKey: 'Protein'
  },
  _vitaminB12 : {
    unit: 'µg',
    unitMember: '_vitaminB12Unit',
    rda2k: 6.0,
    rdaMember: '_vitaminB12RDA',
    visibleMember: '_vitaminB12Visible',
    firebaseKey: 'VitaminB12',
    nutrientKey: 'Vitamin B-12'
  },
  _calcium : {
    unit: 'mg',
    unitMember: '_calciumUnit',
    rda2k: 1000,
    rdaMember: '_calciumRDA',
    visibleMember: '_calciumVisible',
    firebaseKey: 'Calcium',
    nutrientKey: 'Calcium, Ca'
  },
  _iron : {
    unit: 'mg',
    unitMember: '_ironUnit',
    rda2k: 18,
    rdaMember: '_ironRDA',
    visibleMember: '_ironVisible',
    firebaseKey: 'Iron',
    nutrientKey: 'Iron, Fe'
  },
  _vitaminE : {
    unit: 'mg',
    unitMember: '_vitaminEUnit',
    rda2k: 20.1,   // Conversion from 30 IU to natural form (from: https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/)
    rdaMember: '_vitaminERDA',
    visibleMember: '_vitaminEVisible',
    firebaseKey: 'VitaminE',
    nutrientKey: 'Vitamin E (alpha-tocopherol)'
  },
  _vitaminD : {
    unit: 'µg',
    unitMember: '_vitaminDUnit',
    rda2k: undefined,   // TODO: get conversion from 400 IU
    rdaMember: '_vitaminDRDA',
    visibleMember: '_vitaminDVisible',
    firebaseKey: 'VitaminD',
    nutrientKey: 'Vitamin D (D2 + D3)'  // Measured in ug from USDA data
  },
  _niacinB3 : {
    unit: 'mg',
    unitMember: '_niacinB3Unit',
    rda2k: 20,
    rdaMember: '_niacinB3RDA',
    visibleMember: '_niacinB3Visible',
    firebaseKey: 'NiacinB3',
    nutrientKey: 'Niacin'
  },
  _magnesium : {
    unit: 'mg',
    unitMember: '_magnesiumUnit',
    rda2k: 400,
    rdaMember: '_magnesiumRDA',
    visibleMember: '_magnesiumVisible',
    firebaseKey: 'Magnesium',
    nutrientKey: 'Magnesium, Mg'
  },
  _riboflavinB2 : {
    unit: 'mg',
    unitMember: '_riboflavinB2Unit',
    rda2k: 1.7,
    rdaMember: '_riboflavinB2RDA',
    visibleMember: '_riboflavinB2Visible',
    firebaseKey: 'RiboflavinB2',
    nutrientKey: 'Riboflavin'
  },
  _phosphorus : {
    unit: 'mg',
    unitMember: '_phosphorusUnit',
    rda2k: 1000,
    rdaMember: '_phosphorusRDA',
    visibleMember: '_phosphorusVisible',
    firebaseKey: 'Phosphorus',
    nutrientKey: 'Phosphorus, P'
  },
  _zinc : {
    unit:  'mg',
    unitMember: '_zincUnit',
    rda2k: 15,
    rdaMember: '_zincRDA',
    visibleMember: '_zincVisible',
    firebaseKey: 'Zinc',
    nutrientKey: 'Zing, Zn'
  },
  _folicAcid : {  // also folate--see: https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/
    unit: 'µg',
    unitMember: '_folicAcidUnit',
    rda2k: 400,
    rdaMember: '_folicAcidRDA',
    visibleMember: '_folicAcidVisible',
    firebaseKey: 'FolicAcid',
    nutrientKey: 'Folate, DFE'
  },
  _vitaminB6 : {
    unit: 'mg',
    unitMember: '_vitaminB6Unit',
    rda2k: 2.0,
    rdaMember: '_vitaminB6RDA',
    visibleMember: '_vitaminB6Visible',
    firebaseKey: 'VitaminB6',
    nutrientKey: 'Vitamin B-6'
  },
  _potassium : {
    unit: 'mg',
    unitMember: '_potassiumUnit',
    rda2k: 3500,
    rdaMember: '_potassiumRDA',
    visibleMember: '_potassiumVisible',
    firebaseKey: 'Potassium',
    nutrientKey: 'Potassium, K'
  },
  _thiaminB1 : {
    unit: 'mg',
    unitMember: '_thiaminB1Unit',
    rda2k: 1.5,
    rdaMember: '_thiaminB1RDA',
    visibleMember: '_thiaminB1Visible',
    firebaseKey: 'ThiaminB1',
    nutrientKey: 'Thiamin'
  },
  _vitaminC : {
    unit: 'mg',
    unitMember: '_vitaminCUnit',
    rda2k: 60,
    rdaMember: '_vitaminCRDA',
    visibleMember: '_vitaminCVisible',
    firebaseKey: 'VitaminC',
    nutrientKey: 'Vitamin C, total ascorbic acid'
  },
  _sodium : {
    unit: 'mg',
    unitMember: '_sodiumUnit',
    rda2k: 2400,
    rdaMember: '_sodiumRDA',
    visibleMember: '_sodiumVisible',
    firebaseKey: 'Sodium',
    nutrientKey: 'Sodium, Na'
  },
  _vitaminK : {
    unit: 'µg',
    unitMember: '_vitaminKUnit',
    rda2k: 80,
    rdaMember: '_vitaminKRDA',
    visibleMember: '_vitaminKVisible',
    firebaseKey: 'VitaminK',
    nutrientKey: 'Vitamin K (phylloquinone)'
  },
  _vitaminA : {
    unit: 'µg',
    unitMember: '_vitaminAUnit',
    rda2k: undefined, // TODO: get conversion from 5000 IU
    rdaMember: '_vitaminARDA',
    visibleMember: '_vitaminAVisible',
    firebaseKey: 'VitaminA',
    nutrientKey: 'Vitamin A, RAE',
  },
  _vitaminA_IU : {
    unit: 'IU',
    unitMember: '_vitaminA_IUUnit',
    rda2k: 5000,
    rdaMember: '_vitaminA_IURDA',
    visibleMember: '_vitaminA_IUVisible',
    firebaseKey: 'VitaminA_IU',
    nutrientKey: 'Vitamin A, IU'
  },
  _vitaminD_IU : {
    unit: 'IU',
    unitMember: '_vitaminD_IUUnit',
    rda2k: 400,
    rdaMember: '_vitaminD_IURDA',
    visibleMember: '_vitaminD_IUVisible',
    firebaseKey: 'VitaminD_IU',
    nutrientKey: 'Vitamin D'  // Measured in IU from USDA data.
  }
}


// This list composed based on the order in:
//   https://www.fda.gov/downloads/Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation/LabelingNutrition/UCM511964.pdf
//
// Notes:
//   - Vitamin E did not feature so it has been added at the end.
//   - Everything is straightforward except Folate which appears as:
//       Folate 200mcg DFE (120 mcg folic acid)
//
// static:
IngredientModel.microNutrientsAndFnPfxs = {
  'Vitamin D'  : 'get_vitaminD',
  'Calcium'    : 'get_calcium',
  'Iron'       : 'get_iron',
  'Potassium'  : 'get_potassium',
  'Vitamin A'  : 'get_vitaminA',
  'Vitamin C'  : 'get_vitaminC',
  'Thiamin'    : 'get_thiaminB1',
  'Riboflavin' : 'get_riboflavinB2',
  'Niacin'     : 'get_niacinB3',
  'Vitamin B6' : 'get_vitaminB6',
  'Folate'     : 'get_folicAcid',
  'Vitamin B12': 'get_vitaminB12',
  'Phosphorus' : 'get_phosphorus',
  'Magnesium'  : 'get_magnesium',
  'Zinc'       : 'get_zinc',
  'Vitamin E'  : 'get_vitaminE'
}
