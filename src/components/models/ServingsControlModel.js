export class ServingsControlModel {
  constructor() {
    this._servingSize = 1
    // _servingUnit, _servingRatio and _servingAmount are solely for display purposes on the
    // label--i.e. 2 tacos.  The real math is done with this._servingSize above.
    this._servingUnit = 'plate'
    this._servingAmount = '1'
    // i.e. Servings Per Recipe, About 4
    this._servingRatio = 'Recipe, About'
  }
  setServingSize(aValue) {
    this._servingSize = aValue
  }
  getServingSize() {
    return this._servingSize
  }
  setServingUnit(aServingUnit) {
    this._servingUnit = aServingUnit
  }
  getServingUnit() {
    return this._servingUnit
  }
  setServingRatio(aServingRatio) {
    this._servingRatio = aServingRatio
  }
  getServingRatio() {
    return this._servingRatio
  }
  setServingAmount(aServingAmount) {
    this._servingAmount = aServingAmount
  }
  getServingAmount() {
    return this._servingAmount
  }
}
