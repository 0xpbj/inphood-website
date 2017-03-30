const React = require('react')
import Style from "../styles/NutritionEstimateStyles.js"
import ProgressBar from 'react-bootstrap/lib/ProgressBar'
import {IngredientModel} from '../models/IngredientModel'
import * as constants from '../../constants/Constants'

// TODO: Fix this in FDA2018 labels
//
// The label fonts are not the precise fonts mentioned by FDA in their spec. Also,
// the sizes are not the same when we convert from font points to px to ems.
// See more info here:
//   - http://stackoverflow.com/questions/7542214/is-it-possible-to-force-usage-of-custom-fonts-for-text-rendering-on-a-given-web
//   - http://reeddesign.co.uk/test/points-pixels.html
//   - http://www.cssfontstack.com/
//
export default class NutritionEstimateJSX extends React.Component {
  constructor() {
    super()
    this._key = 0
  }

  getKey() {
    return this._key++
  }

  getLabelTitle(styles, ingredientComposite) {
    const servingSizeSentence =
      "Serving Size " +
      ingredientComposite.getDisplayServingCount() + " " +
      ingredientComposite.getDisplayServingUnit() + " (" +
      ingredientComposite.getServingAmount() +
      ingredientComposite.getServingUnit() + ")"

    let servingInfo = [servingSizeSentence]
    if (ingredientComposite.getSuggestedServingUnit() === 'people') {
      servingInfo.push(<br key={0}/>)
      servingInfo.push('Servings Per ' +
                       ingredientComposite.getDisplayServingRatio() +
                       ' ' +
                       ingredientComposite.getSuggestedServingAmount())
    }

    return (
      <header style={styles.performanceFactsHeader}>
        <h1 style={styles.performanceFactsTitle}>Nutrition Facts</h1>
        <p style={styles.performanceFactsHeaderElementP}>
          {servingInfo}
        </p>
      </header>
    )
  }

  getLeftColumnTitle(styles) {
    const sectionStyle =
      {...styles.performanceFactsTableElementTheadTrTh, ...styles.smallInfo}
    return (
      <tr key={this.getKey()}>
        <td colSpan={3} style={sectionStyle}>Amount Per Serving</td>
      </tr>
    )
  }

  getRightColumnTitle(styles) {
    const sectionStyle = {...styles.smallInfo,
                          ...styles.performanceFactsTableElementTdLastChild,
                          ...styles.performanceFactsTableClassThickRowTd}
    return (
      <tr key={this.getKey()}>
        <td colSpan={3} style={sectionStyle}><b>% Daily Value*</b></td>
      </tr>
    )
  }

  getCaloriesRow(styles, ingredientComposite) {
    return (
      <tr key={this.getKey()}>
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          <b>Calories </b>{ingredientComposite.getCalories()}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          Calories from Fat&nbsp;{ingredientComposite.getCaloriesFromFat()}
        </td>
      </tr>
    )
  }

  getSectionRow(
    styles, rowTitle, rowValue, rowUnit, rowRDA=undefined, rowStyle={}) {

    const theRDA = (rowRDA !== undefined) ? parseFloat(rowRDA) + '%' : ''
    return (
      <tr key={this.getKey()} style={rowStyle}>
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          <b>{rowTitle} </b>{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          <b>{theRDA}</b>
        </td>
      </tr>
    )
  }

  getIndentedRow(styles, rowTitle, rowValue, rowUnit, rowRDA=undefined) {

    const theRDA = (rowRDA !== undefined) ? parseFloat(rowRDA) + '%' : ''
    return (
      <tr key={this.getKey()}>
        <td style={{...styles.performanceFactsTableElementTd,
                    ...styles.performanceFactsTableClassBlankCell}}/>
        <th style={styles.performanceFactsTableElementTh}>
          {rowTitle}&nbsp;{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          <b>{theRDA}</b>
        </td>
      </tr>
    )
  }

  // Calculates the number of spaces needed to place a bullet (dot) in the middle
  // of the nutrition label. Then inserts those spaces in an array of html.
  getDotHtml(columnTextLength) {
    let dotHtml = []
    const dotPosition = 28
    const dotOffset = dotPosition - columnTextLength
    if (dotOffset > 0) {
      for (let i = 0; i < dotOffset; i++) {
        dotHtml.push(<span key={this.getKey()}>&nbsp;</span>)
      }
    }
    dotHtml.push(<span key={this.getKey()} style={{fontWeight: 'bold'}}>
                    &bull;
                  </span>)

    return dotHtml
  }

  getDoubleNutrientRow(
    styles, leftName, leftValue, rightName, rightValue, rowStyle={}) {

    const leftChars = leftName.length + leftValue.length + 2 // 2 for spaces below
    const dotHtml = this.getDotHtml(leftChars)

    return (
      <tr key={this.getKey()} style={rowStyle}>
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          {leftName}&nbsp;&nbsp;{leftValue}{dotHtml}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          {rightName}&nbsp;&nbsp;{rightValue}
        </td>
      </tr>
    )
  }

  getTransFatRow(styles, rowValue, rowUnit) {

    return (
      <tr key={this.getKey()}>
        <td style={{...styles.performanceFactsTableElementTd,
                    ...styles.performanceFactsTableClassBlankCell}}/>
        <th style={styles.performanceFactsTableElementTh}>
          <i>Trans</i>&nbsp;Fat&nbsp;{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
        </td>
      </tr>
    )
  }

  getRow(styles,
    rowTitle, rowValue, rowUnit, rowRDA=undefined, rowStyle={}) {

    const theRDA = (rowRDA !== undefined) ? parseFloat(rowRDA) + '%' : ''
    return (
      <tr style={rowStyle} key={this.getKey()} >
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          {rowTitle}&nbsp;{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          {theRDA}
        </td>
      </tr>
    )
  }

  getTableTitle(ingredient, styles) {
    let tableTitle = []

    tableTitle.push(this.getLeftColumnTitle(styles))
    tableTitle.push(this.getCaloriesRow(styles, ingredient))
    tableTitle.push(this.getRightColumnTitle(styles))

    return tableTitle
  }

  getMicroNutrientTitle(ingredient, styles) {
    const leftSectionStyle = {fontSize: '0.9rem',
                              textAlign: 'left',
                              borderBottomStyle: 'solid',
                              borderBottomColor: 'black',
                              borderBottomWidth: '5px'}
    const rightSectionStyle = {fontSize: '0.9rem',
                               textAlign: 'right',
                               borderBottomStyle: 'solid',
                               borderBottomColor: 'black',
                               borderBottomWidth: '5px'}
    return (
      <tr key={this.getKey()}>
        <td colSpan={2} style={leftSectionStyle}><b>Amount Per Serving</b></td>
        <td colSpan={1} style={rightSectionStyle}><b>% Daily Value*</b></td>
      </tr>
    )
  }

  getStandardNutrients(ingredient, styles, endStyle) {
    let standardNutrients = []

    standardNutrients.push(
      this.getSectionRow(styles, 'Total Fat',
                         ingredient.getTotalFatPerServing(),
                         ingredient.getTotalFatUnit(),
                         ingredient.getTotalFatRDA()) )

    standardNutrients.push(
      this.getIndentedRow(styles, 'Saturated Fat',
                          ingredient.getSaturatedFatPerServing(),
                          ingredient.getSaturatedFatUnit(),
                          ingredient.getSaturatedFatRDA()) )

    standardNutrients.push(
      this.getTransFatRow(styles,
                         ingredient.getTransFatPerServing(),
                         ingredient.getTransFatUnit()) )

    standardNutrients.push(
      this.getSectionRow(styles, 'Cholesterol',
                        ingredient.getCholestorol(),
                        ingredient.getCholestorolUnit(),
                        ingredient.getCholestorolRDA()) )

    standardNutrients.push(
      this.getSectionRow(styles, 'Sodium',
                        ingredient.getSodium(),
                        ingredient.getSodiumUnit(),
                        ingredient.getSodiumRDA()) )

    standardNutrients.push(
      this.getSectionRow(styles, 'Total Carbohydrate',
                         ingredient.getTotalCarbohydratePerServing(),
                         ingredient.getTotalCarbohydrateUnit(),
                         ingredient.getTotalCarbohydrateRDA()) )

    standardNutrients.push(
      this.getIndentedRow(styles, 'Dietary Fiber',
                          ingredient.getDietaryFiber(),
                          ingredient.getDietaryFiberUnit(),
                          ingredient.getDietaryFiberRDA()) )

    standardNutrients.push(
      this.getIndentedRow(styles, 'Sugars',
                          ingredient.getSugars(),
                          ingredient.getSugarsUnit()) )

    standardNutrients.push(
     this.getSectionRow(styles, 'Protein',
                        ingredient.getTotalProteinPerServing(),
                        ingredient.getTotalProteinUnit(),
                        undefined, endStyle) )

    return standardNutrients
  }

  getRequiredMicroNutrientsPre2018(ingredient, styles) {
    let standardNutrients = []

    standardNutrients.push(this.getDoubleNutrientRow(styles,
      'Vitamin A', ingredient.get_vitaminA_IURDA() + '%',
      'Vitamin C', ingredient.get_vitaminCRDA() + '%'))

    standardNutrients.push(this.getDoubleNutrientRow(styles,
      'Calcium', ingredient.get_calciumRDA() + '%',
      'Iron', ingredient.get_ironRDA() + '%', styles.thinEnd))

    return standardNutrients
  }

  getMicroNutrients(ingredientComposite, styles) {
    const microNutrientsAndFnPfxs = IngredientModel.microNutrientsAndFnPfxs

    let microNutrientRows = []
    const numNutrients = Object.keys(microNutrientsAndFnPfxs).length
    let idxNutrients = 0

    for (let nutrient in microNutrientsAndFnPfxs) {
      idxNutrients += 1
      const functionPrefix = microNutrientsAndFnPfxs[nutrient]

      if (ingredientComposite[functionPrefix + 'Visible']()) {
        const value = ingredientComposite[functionPrefix]()
        let unit = ingredientComposite[functionPrefix + 'Unit']()
        let rda2k = ingredientComposite[functionPrefix + 'RDA']()

        if (unit === 'µg') {  // Convert 'µg' to 'mcg':
          unit = 'mcg'
        }

        if (rda2k === undefined || isNaN(rda2k)) {  // Handle special cases:
          if (functionPrefix === 'get_vitaminA') {
            rda2k = ingredientComposite['get_vitaminA_IURDA']()
          } else if (functionPrefix === 'get_vitaminD') {
            rda2k = ingredientComposite['get_vitaminD_IURDA']()
          } else {
            console.log('RDA based on 2k calorie diet unavailable.');
            rda2k = ''
          }
        }
        if (rda2k != '') {
          rda2k = rda2k + '%'
        }

        let rowStyle = (idxNutrients === numNutrients) ? styles.thickEnd : {}
        microNutrientRows.push(
          this.getRow(styles, nutrient, value, unit, rda2k, rowStyle))
      }
    }

    return microNutrientRows
  }

  getInPhoodLogo() {
    return(
      <span>
        <span style={{color:'black'}}>i</span>
        <span style={{color:'green'}}>n</span>
        <span style={{color:'blue'}}>P</span>
        <span style={{color:'red'}}>h</span>
        <span style={{color:'green'}}>o</span>
        <span style={{color:'blue'}}>o</span>
        <span style={{color:'red'}}>d</span>
        .com
      </span>
    )
  }

  getGeneratedStatement(displayGeneratedStatement) {
    if (displayGeneratedStatement === true) {
      return(
        <a href="http://www.inphood.com"
           className="text-center"
           style={{backgroundColor: 'white'}}>
          <h6 style={{marginBottom: 0}}>Estimated at {this.getInPhoodLogo()}</h6>
        </a>
      )
    } else {
      return
    }
  }

  render() {
    const myStyles = new Style()
    let resultIsNan = false

    let displayGeneratedStatement = this.props.displayGeneratedStatement
    if (displayGeneratedStatement === undefined) {
      displayGeneratedStatement = false
    }
    // TODO: We should change this to always load from one or the other (one
    //       code path vs. these two--it creates problems for setting whether
    //       things are visible.)
    let ingredientComposite = this.props.ingredientComposite
    // if (ingredientComposite === undefined) {
    //   const nutritionModel = this.props.nutritionModel
    //   if (nutritionModel != undefined) {
    //     ingredientComposite = nutritionModel.getScaledCompositeIngredientModel()
    //   }
    // } else {
    //   resultIsNan = isNaN(ingredientComposite.getCalories())
    //   if (resultIsNan)
    //     return <ProgressBar active now={50} bsStyle="info" />
    // }
    //

    const labelType = ingredientComposite.getLabelType()
    let tableTitle = undefined
    let standardNutrients = undefined
    let requiredMicroNutrients = undefined
    let microNutrients = undefined
    if (labelType === IngredientModel.labelTypes.complete) {
      tableTitle = this.getTableTitle(ingredientComposite, myStyles)
      standardNutrients = this.getStandardNutrients(ingredientComposite,
                                                    myStyles,
                                                    myStyles.thickSeparator);
      requiredMicroNutrients = ''
      microNutrients = this.getMicroNutrients(ingredientComposite, myStyles)
    } else if (labelType === IngredientModel.labelTypes.micronut) {
      tableTitle = this.getMicroNutrientTitle(ingredientComposite, myStyles)
      standardNutrients = '';
      requiredMicroNutrients = ''
      microNutrients = this.getMicroNutrients(ingredientComposite, myStyles)
    } else { // labelType === IngredientModel.labelTypes.standard
      tableTitle = this.getTableTitle(ingredientComposite, myStyles)
      standardNutrients = this.getStandardNutrients(ingredientComposite,
                                                    myStyles,
                                                    myStyles.thickEnd);
      requiredMicroNutrients =
        this.getRequiredMicroNutrientsPre2018(ingredientComposite, myStyles)
      microNutrients = ''
    }


    // The width & auto margin below force the width of the label to be the size
    // of the 'Nutrition Facts' title and center the label in the bounding box.
    // It's important to have this sizing div encapsulate the id=
    // "nutrition-label" div--this way when you save the label, the margin is
    // tight and the saved label looks correct.
    // Other methods here: https://www.sitepoint.com/css-center-position-absolute-div/
    return(
      <div
        style={{width:constants.LABEL_WIDTH, margin:'auto'}}>
        <div
          id="nutrition-label"
          style={{backgroundColor:'white', padding:2}}>
          <section style={myStyles.performanceFacts}>
            {this.getLabelTitle(myStyles, ingredientComposite)}
            <table style={myStyles.performanceFactsTable}>
              <tbody>
                {tableTitle}
                {standardNutrients}
                {requiredMicroNutrients}
                {microNutrients}
              </tbody>
            </table>
            <p style={myStyles.smallInfo}>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
          </section>
          {this.getGeneratedStatement(displayGeneratedStatement)}
        </div>
      </div>
    )
  }
}
