export class IngredientControlModel {
  constructor(editBoxValue,
              units,
              currentUnit,
              matches,
              currentMatch) {
    this._editBoxValue = editBoxValue
    this._dropdownUnits = units
    this._dropdownUnitValue = currentUnit
    this._dropdownMatches = matches
    this._dropdownMatchValue = currentMatch
  }
  getEditBoxValue() {
    return this._editBoxValue
  }
  setEditBoxValue(aValue) {
    this._editBoxValue = aValue
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
