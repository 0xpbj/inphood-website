const UnitSliderMap = {
  ml: {
    min: 0,
    max: 100,
    step: 5,
  },
  l: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  tsp: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  tbsp: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  'fl-oz': {
    min: 0,
    max: 10,
    step: 0.5,
  },
  cup: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  pnt: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  qt: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  g: {
    min: 0,
    max: 100,
    step: 5,
  },
  kg: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  oz: {
    min: 0,
    max: 10,
    step: 0.5,
  },
  lb: {
    min: 0,
    max: 5,
    step: 0.25,
  },
  other: {
    min: 0,
    max: 10,
    step: .5,
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
      this.resetBoundsIfNecessary(this._sliderValue)
    } else {
      this._sliderValue = (this._sliderMax + this._sliderMin) / 2
    }

    this._editBoxValue = this._sliderValue


    this._dropdownUnits = units
    this._dropdownUnitValue = currentUnit

    this._dropdownMatches = matches
    this._dropdownMatchValue = currentMatch
  }

  configureSlidersForUnit(aUnit) {
    // TODO: need to modify configureSlidersForUnit to handle out of range values

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

  getEditBoxValue() {
    return this._editBoxValue
  }

  resetBoundsIfNecessary(aValue) {
    if ((aValue >= this._sliderMin) && (aValue <= this._sliderMax)) {
      return
    }

    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('resetBoundsIfNecessary:');
    console.log('  aValue = ' + aValue);
    console.log('  old _sliderMax = ' + this._sliderMax);
    console.log('  old _sliderMin = ' + this._sliderMin);

    // Set the maximum and minimum slider values to the extremes of 1/2 the number
    // of max increments away from the ceiling of aValue:
    const maxIncrements = 20
    const aValueCeil = Math.ceil(aValue)
    this._sliderMax = aValueCeil + ((maxIncrements * this._sliderStep) / 2)
    this._sliderMin = aValueCeil - ((maxIncrements * this._sliderStep) / 2)

    if (this._sliderMin < 0) {
      this._sliderMin = 0
    }

    console.log('  new _sliderMax = ' + this._sliderMax);
    console.log('  new _sliderMin = ' + this._sliderMin);
  }

  setSliderValue(aValue) {
    this._sliderValue = aValue
    if (this._sliderValue < 0) {
      this._sliderValue = 0
    }
    this.resetBoundsIfNecessary(this._sliderValue)

    this._editBoxValue = this._sliderValue
  }

  setEditBoxValue(aValue) {
    this._editBoxValue = aValue
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
    // TODO: need to modify configureSlidersForUnit to handle out of range values
    // this.configureSlidersForUnit(aValue)
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
