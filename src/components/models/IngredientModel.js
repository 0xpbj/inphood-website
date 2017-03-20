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
//  _vitaminA and _vitaminD do not feature in this b/c the site above uses IU instead
//  of ug/mg
var RDA2000Cal = {
  totalFat: 65,
  saturatedFat: 20,
  cholesterol: 300,
  sodium: 2400,
  carbohydrate: 300,
  fiber: 25,
  _sodium: 2400,  // mg
  _potassium: 3500, // mg
  _vitaminA_IU: 5000, // IU
  _vitaminC: 60, // mg
  _calcium: 1000, // mg
  _iron: 18, // mg
  _vitaminD_IU: 400, // IU
  _vitaminE: 30, // IU  - TODO, I suspect we use micro grams for this measure--need to convert
  _vitaminK: 80, // ug
  _thiaminB1: 1.5, // mg
  _riboflavinB2: 1.7, // mg
  _niacinB3: 20, // mg
  _vitaminB6: 2.0, // mg
  _folicAcid: 400, // ug (value given for folate--used interchangeably with folic acid--see: https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/)
  _vitaminB12: 6.0, // ug
  _phosphorus: 1000, // mg
  _magnesium: 400, // mg
  _zinc: 15, // mg
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

    // The following two loops create all the boilerplate/data-driven
    // member variables for this class.
    //
    //   TODO: thoughts to improve this:
    //           - merge both into one big dictionary for all nutrients
    //           - do we really need the units and to store the units for
    //             each nutrient? (you could make an assumption about
    //             similarity and perform a static check?)
    //
    //
    //   Macronutrients:
    const nutrientMembers = IngredientModel.nutrientMembers
    for (let member in nutrientMembers) {
      const nutrientMember = nutrientMembers[member]

      this[member] = 0
      if (nutrientMember.unitMember !== undefined &&
          nutrientMember.unit !== undefined) {
        this[nutrientMember.unitMember] = nutrientMember.unit
      }
      if (nutrientMember.rdaMember !== undefined &&
          nutrientMember.rda2k !== undefined) {
        this[nutrientMember.rdaMember] = 0
      }
    }
    //
    //   Micronutrients:
    const microNutrientMembers = IngredientModel.microNutrientMembers
    for (let member in microNutrientMembers) {
      const uNutrientMember = microNutrientMembers[member]

      this[member] = 0
      if (uNutrientMember.unitMember !== undefined &&
          uNutrientMember.unit !== undefined) {
        this[uNutrientMember.unitMember] = uNutrientMember.unit
      }
      if (uNutrientMember.rdaMember !== undefined &&
          uNutrientMember.unit !== undefined) {
        this[uNutrientMember.rdaMember] = 0
      }
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
    this['_polyunsatFat'] = getFloatFromDB(dataForKey, 'PolyunsatFat')
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
    //
    // Micronutrients:
    const microNutrientMembers = IngredientModel.microNutrientMembers
    for (let member in microNutrientMembers) {
      const uNutrientMember = microNutrientMembers[member]

      this[member] = getFloatFromDB(dataForKey, uNutrientMember.firebaseKey)
      if (uNutrientMember.unitMember !== undefined &&
          uNutrientMember.unit !== undefined) {
        this[uNutrientMember.unitMember] = uNutrientMember.unit
      }
      if (uNutrientMember.rdaMember !== undefined &&
          uNutrientMember.rda2k !== undefined) {
        this[uNutrientMember.rdaMember] = 100.0 * this[member] / uNutrientMember.rda2k
      }
    }

    this.setServingAmount(
      100, 'g', this._displayServingCount, this._displayServingUnit)
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
      this['_polyunsatFat'] += ingredient['_polyunsatFat'] * scaleFactor
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
      //
      //   Micronutrients:
      const microNutrientMembers = IngredientModel.microNutrientMembers
      for (let member in microNutrientMembers) {
        const uNutrientMember = microNutrientMembers[member]
        if (uNutrientMember.unitMember !== undefined &&
            uNutrientMember.unit !== undefined) {
          throwIfUnitMismatch(uNutrientMember,
                              uNutrientMember.unit,
                              ingredient[uNutrientMember.unitMember],
                              ingredient._tag,
                              ingredient._key)
          this[member] += ingredient[member] * scaleFactor
          this[uNutrientMember.unitMember] = ingredient[uNutrientMember.unitMember]
        }
        if (uNutrientMember.rdaMember !== undefined &&
            uNutrientMember.rda2k !== undefined) {
          this[uNutrientMember.rdaMember] +=
            ingredient[uNutrientMember.rdaMember] * scaleFactor
        }
      }

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
    // Poly unsaturated fat was a late add on:
    const pUnsatFat = '_polyunsatFat'
    if (ingredientData.hasOwnProperty(pUnsatFat)) {
      this[pUnsatFat] = ingredientData[pUnsatFat]
      //Assume unit is also serialized
      const unitMember = pUnsatFat + 'Unit'
      this[unitMember] = ingredientData[unitMember]
    } // else go with constructor values (TODO: consider NDBNO look up to fill
      // this value in and storing it in FB/update)
    //
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
    //
    // Micronutrients:
    //    These were added after serialization, consequently they cannot be restored
    //    for all label serializations
    const microNutrientMembers = IngredientModel.microNutrientMembers
    for (let member in microNutrientMembers) {
      const uNutrientMember = microNutrientMembers[member]

      if (ingredientData.hasOwnProperty(member)) {
        this[member] = ingredientData[member]
        // Assume unit & rda were also serialized
        if (uNutrientMember.unitMember !== undefined &&
            uNutrientMember.unit !== undefined) {
          this[uNutrientMember.unitMember] =
            ingredientData[uNutrientMember.unitMember]
        }
        if (uNutrientMember.rdaMember !== undefined &&
            uNutrientMember.rda2k !== undefined) {
          this[uNutrientMember.rdaMember] =
            ingredientData[uNutrientMember.rdaMember]
        }
      } // else go with the constructor values
      // TODO: in future, might want to use NDBNO to look this up (poses problems
      //       for label.inphood package size & performance; would also want to
      //       re-serialize)
    }

    // sets member var and also scale factor
    // (using the this values here b/c they've been vetted above with hasOwnProperty)
    this.setServingAmount(ingredientData._suggestedServingAmount,
                          ingredientData._suggestedServingUnit,
                          this._displayServingCount,
                          this._displayServingUnit)
  }

  initializeFromBrandedFdaObj(description, searchTerm, foodObject) {
    if (!(foodObject.hasOwnProperty('desc')
          && foodObject.desc.hasOwnProperty('ndbno'))) {
      throw 'Unable to execute IngredientModel.initializeFromBrandedFdaObj. No ndbno data.'
    }
    this._ndbno = foodObject.desc.ndbno

    this._key = description
    this._tag = searchTerm

    //   Generic measures/Unit:
    this._servingAmount = 100

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
        // TODO:
        // case "Fatty acids, total monounsaturated":
        //   ...
        //   break
        case "Fatty acids, total polyunsaturated":
          throwIfUnexpectedUnit(nName, "", nUnit)
          this['_polyunsatFat'] = nValue
          break
        case "Fatty acids, total trans":
          throwIfUnexpectedUnit("Fatty acids, total trans", "g", nUnit)
          this._transFatPerServing = nValue
          break
        case "Cholesterol":
          throwIfUnexpectedUnit("Cholesterol", "mg", nUnit)
          this._cholesterol = nValue
          this._cholesterolRDA = 100.0 * this._cholesterol / RDA2000Cal.cholesterol
          break
        default:
          // Micronutrients:
          //    Check to see if nName is in the nutrientKey values of the
          //    IngredientModel.microNutrientMembers:
          const microNutrientMembers = IngredientModel.microNutrientMembers
          for (let member in microNutrientMembers) {
            const uNutrientMember = microNutrientMembers[member]

            if (nName === uNutrientMember.nutrientKey) {
              // TODO:
              //   - special cases:
              //         "Vitamin D" measured in IU
              //         "Vitamin D (D2 + D3)" measured in ug
              if (uNutrientMember.unitMember !== undefined &&
                  uNutrientMember.unit !== undefined) {
                throwIfUnexpectedUnit(nName, uNutrientMember.unit, nUnit)
              }
              this[member] = nValue
              if (uNutrientMember.rdaMember !== undefined &&
                  uNutrientMember.rda2k !== undefined) {
                this[uNutrientMember.rdaMember] =
                  100 * nValue / uNutrientMember.rda2k
              }
              break
            }
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

// TODO: integrate this the way we did for microNutrientMembers:
//
IngredientModel.nutrientMembers = {
  _calories : {
    unit: undefined,
    unitMember: undefined,
    rda2k: 2000,
    rdaMember: undefined,
    firebaseKey: 'kcal',
    nutrientKey: 'Energy'
  },
  _totalFatPerServing : {
    unit: 'g',
    unitMember: '_totalFatUnit',
    rda2k: 65,
    rdaMember: '_totalFatRDA',
    firebaseKey: 'Fat',
    nutrientKey: 'Total lipid (fat)'
  },
  _saturatedFatPerServing : {
    unit: 'g',
    unitMember: '_saturatedFatUnit',
    rda2k: 20,
    rdaMember: '_saturatedFatRDA',
    firebaseKey: 'SatFat',
    nutrientKey: 'Fatty acids, total saturated'
  },
  _transFatPerServing : {
    unit: 'g',
    unitMember: '_transFatUnit',
    rda2k: undefined,
    rdaMember: undefined,
    firebaseKey: 'TransFat',
    nutrientKey: 'Fatty acids, total trans'
  },
  _polyunsatFat : {
    unit: 'g',
    unitMember: '_polyunsatFatUnit',
    rda2k: undefined,
    rdaMember: undefined,
    firebaseKey: 'PolyunsatFat',
    nutrientKey: 'Fatty acids, total polyunsaturated'
  },
  _cholesterol : {
    unit: 'mg',
    unitMember: '_cholesterolUnit',
    rda2k: 300,
    rdaMember: '_cholesterolRDA',
    firebaseKey: 'Cholesterol',
    nutrientKey: 'Cholesterol'
  },
  _sodium : {
    unit: 'mg',
    unitMember: '_sodiumUnit',
    rda2k: 2400,
    rdaMember: '_sodiumRDA',
    firebaseKey: 'Sodium',
    nutrientKey: 'Sodium, Na'
  },
  _totalCarbohydratePerServing : {
    unit: 'g',
    unitMember: '_totalCarbohydrateUnit',
    rda2k: 300,
    rdaMember: '_totalCarbohydrateRDA',
    firebaseKey: 'Carbohydrate',
    nutrientKey: 'Carbohydrate, by difference'
  },
  _dietaryFiber : {
    unit: 'g',
    unitMember: '_dietaryFiberUnit',
    rda2k: 25,
    rdaMember: '_dietaryFiberRDA',
    firebaseKey: 'Fiber',
    nutrientKey: 'Fiber, total dietary'
  },
  _sugars : {
    unit: 'g',
    unitMember: '_sugarsUnit',
    rda2k: undefined,
    rdaMember: undefined,
    firebaseKey: 'Sugar',
    nutrientKey: 'Sugars, total'
  },
  _totalProteinPerServing : {
    unit: 'g',
    unitMember: '_totalProteinUnit',
    rda2k: 50,
    rdaMember: undefined,
    firebaseKey: 'Protein',
    nutrientKey: 'Protein'
  }
}
// static var:
IngredientModel.microNutrientMembers = {
  _vitaminB12 : {
    unit: 'µg',
    unitMember: '_vitaminB12Unit',
    rda2k: 6.0,
    rdaMember: '_vitaminB12RDA',
    firebaseKey: 'VitaminB12',
    nutrientKey: 'Vitamin B-12'
  },
  _calcium : {
    unit: 'mg',
    unitMember: '_calciumUnit',
    rda2k: 1000,
    rdaMember: '_calciumRDA',
    firebaseKey: 'Calcium',
    nutrientKey: 'Calcium, Ca'
  },
  _iron : {
    unit: 'mg',
    unitMember: '_ironUnit',
    rda2k: 18,
    rdaMember: '_ironRDA',
    firebaseKey: 'Iron',
    nutrientKey: 'Iron, Fe'
  },
  _vitaminE : {
    unit: 'mg',
    unitMember: '_vitaminEUnit',
    rda2k: undefined,   // TODO: get conversion from 30 IU
    rdaMember: '_vitaminERDA',
    firebaseKey: 'VitaminE',
    nutrientKey: 'Vitamin E (alpha-tocopherol)'
  },
  _vitaminD : {
    unit: 'µg',
    unitMember: '_vitaminDUnit',
    rda2k: undefined,   // TODO: get conversion from 400 IU
    rdaMember: '_vitaminDRDA',
    firebaseKey: 'VitaminD',
    nutrientKey: 'Vitamin D (D2 + D3)'  // Measured in ug from USDA data
  },
  _niacinB3 : {
    unit: 'mg',
    unitMember: '_niacinB3Unit',
    rda2k: 20,
    rdaMember: '_niacinB3RDA',
    firebaseKey: 'NiacinB3',
    nutrientKey: 'Niacin'
  },
  _magnesium : {
    unit: 'mg',
    unitMember: '_magnesiumUnit',
    rda2k: 400,
    rdaMember: '_magnesiumRDA',
    firebaseKey: 'Magnesium',
    nutrientKey: 'Magnesium, Mg'
  },
  _riboflavinB2 : {
    unit: 'mg',
    unitMember: '_riboflavinB2Unit',
    rda2k: 1.7,
    rdaMember: '_riboflavinB2RDA',
    firebaseKey: 'RiboflavinB2',
    nutrientKey: 'Riboflavin'
  },
  _phosphorus : {
    unit: 'mg',
    unitMember: '_phosphorusUnit',
    rda2k: 1000,
    rdaMember: '_phosphorusRDA',
    firebaseKey: 'Phosphorus',
    nutrientKey: 'Phosphorus, P'
  },
  _zinc : {
    unit:  'mg',
    unitMember: '_zincUnit',
    rda2k: 15,
    rdaMember: '_zincRDA',
    firebaseKey: 'Zinc',
    nutrientKey: 'Zing, Zn'
  },
  _folicAcid : {  // also folate--see: https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/
    unit: 'µg',
    unitMember: '_folicAcidUnit',
    rda2k: 400,
    rdaMember: '_folicAcidRDA',
    firebaseKey: 'FolicAcid',
    nutrientKey: 'Folate, DFE'
  },
  _vitaminB6 : {
    unit: 'mg',
    unitMember: '_vitaminB6Unit',
    rda2k: 2.0,
    rdaMember: '_vitaminB6RDA',
    firebaseKey: 'VitaminB6',
    nutrientKey: 'Vitamin B-6'
  },
  _potassium : {
    unit: 'mg',
    unitMember: '_potassiumUnit',
    rda2k: 3500,
    rdaMember: '_potassiumRDA',
    firebaseKey: 'Potassium',
    nutrientKey: 'Potassium, K'
  },
  _thiaminB1 : {
    unit: 'mg',
    unitMember: '_thiaminB1Unit',
    rda2k: 1.5,
    rdaMember: '_thiaminB1RDA',
    firebaseKey: 'ThiaminB1',
    nutrientKey: 'Thiamin'
  },
  _vitaminC : {
    unit: 'mg',
    unitMember: '_vitaminCUnit',
    rda2k: 60,
    rdaMember: '_vitaminCRDA',
    firebaseKey: 'VitaminC',
    nutrientKey: 'Vitamin C, total ascorbic acid'
  },
  _sodium : {
    unit: 'mg',
    unitMember: '_sodiumUnit',
    rda2k: 2400,
    rdaMember: '_sodiumRDA',
    firebaseKey: 'Sodium',
    nutrientKey: 'Sodium, Na'
  },
  _vitaminK : {
    unit: 'µg',
    unitMember: '_vitaminKUnit',
    rda2k: 80,
    rdaMember: '_vitaminKRDA',
    firebaseKey: 'VitaminK',
    nutrientKey: 'Vitamin K (phylloquinone)'
  },
  _vitaminA : {
    unit: 'µg',
    unitMember: '_vitaminAUnit',
    rda2k: undefined, // TODO: get conversion from 5000 IU
    rdaMember: '_vitaminARDA',
    firebaseKey: 'VitaminA',
    nutrientKey: 'Vitamin A, RAE',
  },
  _vitaminA_IU : {
    unit: 'IU',
    unitMember: '_vitaminA_IUUnit',
    rda2k: 5000,
    rdaMember: '_vitaminA_IURDA',
    firebaseKey: 'VitaminA_IU',
    nutrientKey: 'Vitamin A, IU'
  },
  _vitaminD_IU : {
    unit: 'IU',
    unitMember: '_vitaminD_IUUnit',
    rda2k: 400,
    rdaMember: '_vitaminD_IURDA',
    firebaseKey: 'VitaminD_IU',
    nutrientKey: 'Vitamin D'  // Measured in IU from USDA data.
  }
}
