const React = require('react')
import Style from "../styles/NutritionEstimateStyles.js"
import ProgressBar from 'react-bootstrap/lib/ProgressBar'

export default class NutritionEstimateJSX extends React.Component {
  getLabelTitle(styles, ingredientComposite) {
    const servingSizeSentence =
      "Serving Size " +
      ingredientComposite.getDisplayServingCount() + " " +
      ingredientComposite.getDisplayServingUnit() + " (" +
      ingredientComposite.getServingAmount() +
      ingredientComposite.getServingUnit() + ")"

    let servingInfo = [servingSizeSentence]
    if (ingredientComposite.getSuggestedServingUnit() === 'people') {
      servingInfo.push(<br/>)
      servingInfo.push('Servings Per Recipe about ' + ingredientComposite.getSuggestedServingAmount())
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
      <thead>
        <tr><th colSpan={3} style={sectionStyle}>Amount Per Serving</th></tr>
      </thead>
    )
  }

  getRightColumnTitle(styles) {
    const sectionStyle = {...styles.smallInfo,
                          ...styles.performanceFactsTableElementTdLastChild,
                          ...styles.performanceFactsTableClassThickRowTd}
    return (
      <tr><td colSpan={3} style={sectionStyle}><b>% Daily Value*</b></td></tr>)
  }

  getCaloriesRow(styles, ingredientComposite) {
    return (
      <tr>
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
      <tr style={rowStyle}>
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          <b>{rowTitle} </b>{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          <b>{theRDA}</b>
        </td>
      </tr>
    )
  }

  getIndentedRow(styles, rowTitle, rowValue, rowUnit, rowRDA = undefined) {

    const theRDA = (rowRDA !== undefined) ? parseFloat(rowRDA) + '%' : ''
    return (
      <tr>
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

  getRow(styles, rowTitle, rowValue, rowUnit, rowRDA=undefined, rowStyle={}) {

    const theRDA = (rowRDA !== undefined) ? parseFloat(rowRDA) + '%' : ''
    return (
      <tr style={rowStyle}>
        <th colSpan={2} style={styles.performanceFactsTableElementTh}>
          {rowTitle}&nbsp;{rowValue}{rowUnit}
        </th>
        <td style={styles.performanceFactsTableElementTdLastChild}>
          {theRDA}
        </td>
      </tr>
    )
  }

  getMicroNutrients(ingredientComposite, styles) {
    const microNutrientsAndFnPfxs = NutritionEstimateJSX.microNutrientsAndFnPfxs

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
          rda2k = parseInt(rda2k) + '%'
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


    // The div-in-div below and margin of 4 is to fix a save image issue (where it
    // cuts off part of the nutrition label border and the generated at inphood.com
    // is too low on the image).
    return(
      <div
        id="nutrition-label"
        style={{backgroundColor:'white', padding:2}}>
        <div style={{margin:0}}>
          <section style={myStyles.performanceFacts}>
            {this.getLabelTitle(myStyles, ingredientComposite)}

            <table style={myStyles.performanceFactsTable}>
              {this.getLeftColumnTitle(myStyles)}
              <tbody>

                {this.getCaloriesRow(myStyles, ingredientComposite)}
                {this.getRightColumnTitle(myStyles)}

                {this.getSectionRow(myStyles, 'Total Fat',
                                    ingredientComposite.getTotalFatPerServing(),
                                    ingredientComposite.getTotalFatUnit(),
                                    ingredientComposite.getTotalFatRDA())}

                {this.getIndentedRow(myStyles, 'Saturated Fat',
                                     ingredientComposite.getSaturatedFatPerServing(),
                                     ingredientComposite.getSaturatedFatUnit(),
                                     ingredientComposite.getSaturatedFatRDA())}

                {this.getIndentedRow(myStyles, 'Trans Fat',
                                     ingredientComposite.getTransFatPerServing(),
                                     ingredientComposite.getTransFatUnit())}

                {this.getSectionRow(myStyles, 'Cholesterol',
                                    ingredientComposite.getCholestorol(),
                                    ingredientComposite.getCholestorolUnit(),
                                    ingredientComposite.getCholestorolRDA())}

                {this.getSectionRow(myStyles, 'Sodium',
                                    ingredientComposite.getSodium(),
                                    ingredientComposite.getSodiumUnit(),
                                    ingredientComposite.getSodiumRDA())}

                {this.getSectionRow(
                  myStyles, 'Total Carbohydrate',
                  ingredientComposite.getTotalCarbohydratePerServing(),
                  ingredientComposite.getTotalCarbohydrateUnit(),
                  ingredientComposite.getTotalCarbohydrateRDA())}

                {this.getIndentedRow(myStyles, 'Dietary Fiber',
                                     ingredientComposite.getDietaryFiber(),
                                     ingredientComposite.getDietaryFiberUnit(),
                                     ingredientComposite.getDietaryFiberRDA())}

                {this.getIndentedRow(myStyles, 'Sugars',
                                    ingredientComposite.getSugars(),
                                    ingredientComposite.getSugarsUnit())}

                {this.getSectionRow(
                  myStyles, 'Protein',
                  ingredientComposite.getTotalProteinPerServing(),
                  ingredientComposite.getTotalProteinUnit(),
                  undefined, myStyles.thickSeparator)}

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
