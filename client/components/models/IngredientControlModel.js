const UnitSliderMap = {
  ml: {
    min: 0,
    max: 500,
    step: 10,
  },
  l: {
    min: 0,
    max: 10,
    step: 1,
  },
  tsp: {
    min: 0,
    max: 20,
    step: 0.25,
  },
  tbsp: {
    min: 0,
    max: 20,
    step: 0.25,
  },
  'fl-oz': {
    min: 0,
    max: 32,
    step: 1,
  },
  cup: {
    min: 0,
    max: 20,
    step: 0.25,
  },
  pnt: {
    min: 0,
    max: 10,
    step: 0.25,
  },
  qt: {
    min: 0,
    max: 10,
    step: 0.25,
  },
  g: {
    min: 0,
    max: 500,
    step: 10,
  },
  kg: {
    min: 0,
    max: 5,
    step: 0.125,
  },
  oz: {
    min: 0,
    max: 32,
    step: 0.25,
  },
  lb: {
    min: 0,
    max: 10,
    step: 0.25,
  },
  other: {
    min: 1,
    max: 20,
    step: 0.25
  }
}

export class IngredientControlModel {
  constructor(sliderValue,
              units,
              currentUnit,
              matches,
              currentMatch) {

    this.configureSlidersForUnit(currentUnit)

    if (sliderValue != -1) {
      this._sliderValue = sliderValue
    } else {
      this._sliderValue = (this._sliderMax + this._sliderMin) / 2
    }


    this._dropdownUnits = units
    this._dropdownUnitValue = currentUnit

    this._dropdownMatches = matches
    this._dropdownMatchValue = currentMatch
  }

  configureSlidersForUnit(aUnit) {
    // Handle situations like 'pat' of butter or 'filet' of fish by using
    // the setting 'other':
    //
    let mapSlidersToUnit = aUnit
    if (! (mapSlidersToUnit in UnitSliderMap)) {
      mapSlidersToUnit = 'other'
    }
    this._sliderMin = UnitSliderMap[mapSlidersToUnit].min
    this._sliderMax = UnitSliderMap[mapSlidersToUnit].max
    this._sliderStep = UnitSliderMap[mapSlidersToUnit].step
  }

  getSliderValue() {
    return this._sliderValue
  }

  setSliderValue(aValue) {
    this._sliderValue = aValue

    // TODO: if this exceeds max, re-scale the Maximum to this value + 5 increments?
    // (this will happen when we use our own edit box instead of the one with the
    //  sliders)
  }

  getSliderMin() {
    return this._sliderMin
  }

  getSliderMax() {
    return this._sliderMax
  }

  getSliderStep() {
    return this._sliderStep
  }

  getDropdownUnits() {
    return this._dropdownUnits
  }

  setDropdownUnits(theUnits) {
    this._dropdownUnits = theUnits
  }

  getDropdownUnitValue() {
    return this._dropdownUnitValue
  }

  setDropdownUnitValue(aValue) {
    this.configureSlidersForUnit(aValue)
    this._dropdownUnitValue = aValue
  }

  getDropdownMatches() {
    return this._dropdownMatches
  }

  getDropdownMatchValue() {
    return this._dropdownMatchValue
  }

  setDropdownMatchValue(aValue) {
    this._dropdownMatchValue = aValue
  }
}
