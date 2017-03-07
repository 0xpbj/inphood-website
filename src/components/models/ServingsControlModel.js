export class ServingsControlModel {
  constructor() {
    // WARNING: we keep things this way b/c the serialized data in firebase
    // depends upon this._value and this._unit to be handled properly. Changing
    // these will break customer labels:
    //
    // Used to be possible to choose 'people' or 'grams'.
    // We've now locked it to 'people', which divides the total number of grams
    // in a recipe by this._value:
    this._value = 2
    this._unit = 'people'
    //
    // _displayUnit and _displayUnitCount are solely for display purposes on the
    // label--i.e. 2 tacos.  The real math is done with this._value above.
    this._displayUnit = 'serving'
    this._displayUnitCount = 1
    this._min = 1
    this._max = 20
    this._step = 1

    this._valueEditBox = '2'
    this._displayUnitEditBox = 'serving'
  }

  rescaleMinAndMax(aValue) {
    if ((aValue >= this._min) && (aValue <= this._max)) {
      return
    }

    const numUnitPositions = 20

    this._min = Math.floor(aValue - (numUnitPositions / 2))
    if (this._min < 1) {
      this._min = 1
    }

    this._max = this._min + (numUnitPositions - 1)
  }

  setValue(aValue) {
    this.rescaleMinAndMax(aValue)
    this._value = aValue
  }

  getValue() {
    return this._value
  }

  getUnit() {
    return this._unit
  }

  setDisplayUnit(aDisplayUnit) {
    this._displayUnit = aDisplayUnit
  }

  getDisplayUnit() {
    return this._displayUnit
  }

  setDisplayUnitCount(aDisplayUnitCount) {
    this._displayUnitCount = aDisplayUnitCount
  }

  getDisplayUnitCount() {
    return this._displayUnitCount
  }

  getMin() {
    return this._min
  }

  getMax() {
    return this._max
  }

  getStep() {
    return this._step
  }

  setValueEditBox(aValue) {
    this._valueEditBox = aValue
  }

  getValueEditBox() {
    return this._valueEditBox
  }

  setDisplayUnitEditBox(aDisplayUnit) {
    this._displayUnitEditBox = aDisplayUnit
  }

  getDisplayUnitEditBox() {
    return this._displayUnitEditBox
  }
}
