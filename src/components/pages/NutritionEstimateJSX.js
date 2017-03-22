const React = require('react')
import Style from "../styles/NutritionEstimateStyles.js"
import ProgressBar from 'react-bootstrap/lib/ProgressBar'

export default class NutritionEstimateJSX extends React.Component {
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
  getMicroNutrients(ingredientComposite, styles) {
    let microNutrientRows = []
    const numNutrients =
      Object.keys(NutritionEstimateJSX.microNutrientsAndFnPfxs).length
    let idxNutrients = 0

    for (let nutrient in NutritionEstimateJSX.microNutrientsAndFnPfxs) {
      idxNutrients += 1
      const functionPrefix =
        NutritionEstimateJSX.microNutrientsAndFnPfxs[nutrient]
      const getVisibleFn = functionPrefix + 'Visible'

      if (ingredientComposite[getVisibleFn]()) {
        const getValueFn = functionPrefix
        const getUnitFn = functionPrefix + 'Unit'
        const getRDAFn = functionPrefix + 'RDA'

        const value = ingredientComposite[getValueFn]()
        let unit = ingredientComposite[getUnitFn]()
        let rda2k = ingredientComposite[getRDAFn]()

        // Convert 'µg' to 'mcg':
        if (unit === 'µg') {
          unit = 'mcg'
        }

        // Handle special cases:
        if (rda2k === undefined || isNaN(rda2k)) {
          if (functionPrefix === 'get_vitaminA') {
            const getAltRDAFn = 'get_vitaminA_IURDA'
            rda2k = ingredientComposite[getAltRDAFn]()
          } else if (functionPrefix === 'get_vitaminD') {
            const getAltRDAFn = 'get_vitaminD_IURDA'
            rda2k = ingredientComposite[getAltRDAFn]()
          } else {
            console.log('RDA based on 2k calorie diet unavailable.');
            rda2k = ''
          }
        }
        if (rda2k != '') {
          rda2k = parseInt(rda2k) + '%'
        }

        let trStyle = (idxNutrients === numNutrients) ? styles.thickEnd : {}

        microNutrientRows.push(
          <tr style={trStyle}>
            <th colSpan={2} style={styles.performanceFactsTableElementTh}>
              {nutrient}&nbsp;
              {value}
              {unit}
            </th>
            <td style={styles.performanceFactsTableElementTdLastChild}>
              {rda2k}
            </td>
          </tr>
        )
      }
    }

    return microNutrientRows
  }

  render() {
    // console.log('LABEL TYPE: ', this.props.labelType);
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

    const servingSizeSentence =
      "Serving Size " +
      ingredientComposite.getDisplayServingCount() + " " +
      ingredientComposite.getDisplayServingUnit() + " (" +
      ingredientComposite.getServingAmount() +
      ingredientComposite.getServingUnit() + ")"

    const showServingsPerContainer =
      (ingredientComposite.getSuggestedServingUnit() === 'people')
    const servingSection = (showServingsPerContainer === '') ?
      (<p style={myStyles.performanceFactsHeaderElementP}>{servingSizeSentence}</p>) :
      (<p style={myStyles.performanceFactsHeaderElementP}>{servingSizeSentence}<br/>
        Servings Per Recipe about {ingredientComposite.getSuggestedServingAmount()}</p>)

    // The div-in-div below and margin of 4 is to fix a save image issue (where it
    // cuts off part of the nutrition label border and the generated at inphood.com
    // is too low on the image).
    return(
      <div
        id="nutrition-label"
        style={{backgroundColor:'white', padding:2}}>
        <div style={{margin:0}}>
          <section style={myStyles.performanceFacts}>
            <header style={myStyles.performanceFactsHeader}>
              <h1 style={myStyles.performanceFactsTitle}>Nutrition Facts</h1>
              {servingSection}
            </header>
            <table style={myStyles.performanceFactsTable}>
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    style={{...myStyles.performanceFactsTableElementTheadTrTh,
                            ...myStyles.smallInfo}}>
                    Amount Per Serving
                  </th>
                </tr>
              </thead>
              <tbody>

                <tr>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Calories </b>
                    {ingredientComposite.getCalories()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    Calories from Fat&nbsp;
                    {ingredientComposite.getCaloriesFromFat()}
                  </td>
                </tr>

                <tr>
                  <td colSpan={3}
                    style={{...myStyles.smallInfo,
                            ...myStyles.performanceFactsTableElementTdLastChild,
                            ...myStyles.performanceFactsTableClassThickRowTd}}>
                    <b>% Daily Value*</b>
                  </td>
                </tr>

                <tr>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Total Fat </b>
                    {ingredientComposite.getTotalFatPerServing()}
                    {ingredientComposite.getTotalFatUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getTotalFatRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{...myStyles.performanceFactsTableElementTd,
                            ...myStyles.performanceFactsTableClassBlankCell}}>
                  </td>
                  <th style={myStyles.performanceFactsTableElementTh}>
                    Saturated Fat&nbsp;
                    {ingredientComposite.getSaturatedFatPerServing()}
                    {ingredientComposite.getSaturatedFatUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getSaturatedFatRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{...myStyles.performanceFactsTableElementTd,
                            ...myStyles.performanceFactsTableClassBlankCell}}>
                  </td>
                  <th style={myStyles.performanceFactsTableElementTh}>
                    Trans Fat&nbsp;
                    {ingredientComposite.getTransFatPerServing()}
                    {ingredientComposite.getTransFatUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  </td>
                </tr>

                <tr>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Cholesterol </b>
                    {ingredientComposite.getCholestorol()}
                    {ingredientComposite.getCholestorolUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getCholestorolRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Sodium </b>
                    {ingredientComposite.getSodium()}
                    {ingredientComposite.getSodiumUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getSodiumRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Total Carbohydrate </b>
                    {ingredientComposite.getTotalCarbohydratePerServing()}
                    {ingredientComposite.getTotalCarbohydrateUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getTotalCarbohydrateRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{...myStyles.performanceFactsTableElementTd,
                            ...myStyles.performanceFactsTableClassBlankCell}}>
                  </td>
                  <th style={myStyles.performanceFactsTableElementTh}>
                    Dietary Fiber&nbsp;
                    {ingredientComposite.getDietaryFiber()}
                    {ingredientComposite.getDietaryFiberUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                    <b>{ingredientComposite.getDietaryFiberRDA()}%</b>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{...myStyles.performanceFactsTableElementTd,
                            ...myStyles.performanceFactsTableClassBlankCell}}>
                  </td>
                  <th style={myStyles.performanceFactsTableElementTh}>
                    Sugars&nbsp;
                    {ingredientComposite.getSugars()}
                    {ingredientComposite.getSugarsUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  </td>
                </tr>

                <tr style={myStyles.thickSeparator}>
                  <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                    <b>Protein </b>
                    {ingredientComposite.getTotalProteinPerServing()}
                    {ingredientComposite.getTotalProteinUnit()}
                  </th>
                  <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  </td>
                </tr>

                {this.getMicroNutrients(ingredientComposite, myStyles)}

              </tbody>
            </table>
            <p style={myStyles.smallInfo}>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs:</p>
          </section>
          {this.getGeneratedStatement(displayGeneratedStatement)}
        </div>
      </div>
    )
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
NutritionEstimateJSX.microNutrientsAndFnPfxs = {
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
