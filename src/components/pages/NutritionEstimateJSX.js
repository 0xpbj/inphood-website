<<<<<<< HEAD
var React = require('react')
import Style from "../styles/NutritionEstimate.js"
=======
import React from "react"
import Style from "../styles/NutritionEstimateStyles.js"
>>>>>>> b333f5c2719121c076e98b7163c0cdfb4822d38d

export default class NutritionEstimateJSX extends React.Component {
  render() {
    const myStyles = new Style()

    return (
      <div>
        <section style={myStyles.performanceFacts}>
          <header style={myStyles.performanceFactsHeader}>
            <h1 style={myStyles.performanceFactsTitle}>Nutrition Estimate</h1>
            <p style={myStyles.perfomanceFactsHeaderElementP}>
              Serving Size {this.props.servingAmount} {this.props.servingUnit}</p>
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
                  {this.props.totalCal}
                </th>
                <td style={myStyles.performanceFactsTableElementTd}>
                  Calories from Fat&nbsp;
                  {this.props.totalFatCal}
                </td>
              </tr>

              <tr className="thick-row">
                <td colSpan={3}
                style={{...myStyles.performanceFactsTableClassThickRowTd,
                        ...myStyles.smallInfo,
                        ...myStyles.performanceFactsTableElementTd}}>
                  <b>% Daily Value*</b>
                </td>
              </tr>

              <tr>
                <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                  <b>Total Fat </b>
                  {this.props.totalFat}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.totalFatDayPerc}</b>
                </td>
              </tr>

              <tr>
                <td
                  style={{...myStyles.performanceFactsTableClassBlankCell,
                          ...myStyles.performanceFactsTableElementTd}}>
                </td>
                <th style={myStyles.performanceFactsTableElementTh}>
                  Saturated Fat&nbsp;
                  {this.props.saturatedFat}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.saturatedFatDayPerc}</b>
                </td>
              </tr>

              <tr>
                <td
                  style={{...myStyles.performanceFactsTableClassBlankCell,
                          ...myStyles.performanceFactsTableElementTd}}>
                </td>
                <th style={myStyles.performanceFactsTableElementTh}>
                  Trans Fat&nbsp;
                  {this.props.transFat}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                </td>
              </tr>

              <tr>
                <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                  <b>Cholesterol </b>
                  {this.props.cholesterol}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.cholesterolDayPerc}</b>
                </td>
              </tr>

              <tr>
                <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                  <b>Sodium </b>
                  {this.props.sodium}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.sodiumDayPerc}</b>
                </td>
              </tr>

              <tr>
                <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                  <b>Total Carbohydrate </b>
                  {this.props.totalCarb}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.totalCarbDayPerc}</b>
                </td>
              </tr>

              <tr>
                <td
                  style={{...myStyles.performanceFactsTableClassBlankCell,
                          ...myStyles.performanceFactsTableElementTd}}>
                </td>
                <th style={myStyles.performanceFactsTableElementTh}>
                  Dietary Fiber&nbsp;
                  {this.props.fiber}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                  <b>{this.props.fiberDayPerc}</b>
                </td>
              </tr>

              <tr>
                <td
                  style={{...myStyles.performanceFactsTableClassBlankCell,
                          ...myStyles.performanceFactsTableElementTd}}>
                </td>
                <th style={myStyles.performanceFactsTableElementTh}>
                  Sugars&nbsp;
                  {this.props.sugars}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                </td>
              </tr>

              <tr style={myStyles.thickEnd}>
                <th colSpan={2} style={myStyles.performanceFactsTableElementTh}>
                  <b>Protein </b>
                  {this.props.protein}
                </th>
                <td style={myStyles.performanceFactsTableElementTdLastChild}>
                </td>
              </tr>

            </tbody>
          </table>
          <p style={myStyles.smallInfo}>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs:</p>
        </section>
      </div>
    );
  }
}
