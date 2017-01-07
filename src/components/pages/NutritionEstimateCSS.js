import React from "react"
import '../styles/NutritionEstimate.css'

export default class NutritionEstimateCSS extends React.Component {
  render() {
    return (
      <div>
        <section className="performance-facts">
          <header className="performance-facts__header">
            <h1 className="performance-facts__title">Nutrition Estimate</h1>
            <p>Serving Size {this.props.servingAmount} {this.props.servingUnit}</p>
          </header>
          <table className="performance-facts__table">
            <thead>
              <tr>
                <th colSpan={3} className="small-info">
                  Amount Per Serving
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colSpan={2}>
                  <b>Calories </b>
                  {this.props.totalCal}
                </th>
                <td>
                  Calories from Fat&nbsp;
                  {this.props.totalFatCal}
                </td>
              </tr>
              <tr className="thick-row">
                <td colSpan={3} className="small-info">
                  <b>% Daily Value*</b>
                </td>
              </tr>
              <tr>
                <th colSpan={2}>
                  <b>Total Fat </b>
                  {this.props.totalFat}
                </th>
                <td>
                  <b>{this.props.totalFatDayPerc}</b>
                </td>
              </tr>
              <tr>
                <td className="blank-cell">
                </td>
                <th>
                  Saturated Fat&nbsp;
                  {this.props.saturatedFat}
                </th>
                <td>
                  <b>{this.props.saturatedFatDayPerc}</b>
                </td>
              </tr>
              <tr>
                <td className="blank-cell">
                </td>
                <th>
                  Trans Fat&nbsp;
                  {this.props.transFat}
                </th>
                <td>
                </td>
              </tr>
              <tr>
                <th colSpan={2}>
                  <b>Cholesterol </b>
                  {this.props.cholesterol}
                </th>
                <td>
                  <b>{this.props.cholesterolDayPerc}</b>
                </td>
              </tr>
              <tr>
                <th colSpan={2}>
                  <b>Sodium </b>
                  {this.props.sodium}
                </th>
                <td>
                  <b>{this.props.sodiumDayPerc}</b>
                </td>
              </tr>
              <tr>
                <th colSpan={2}>
                  <b>Total Carbohydrate </b>
                  {this.props.totalCarb}
                </th>
                <td>
                  <b>{this.props.totalCarbDayPerc}</b>
                </td>
              </tr>
              <tr>
                <td className="blank-cell">
                </td>
                <th>
                  Dietary Fiber&nbsp;
                  {this.props.fiber}
                </th>
                <td>
                  <b>{this.props.fiberDayPerc}</b>
                </td>
              </tr>
              <tr>
                <td className="blank-cell">
                </td>
                <th>
                  Sugars&nbsp;
                  {this.props.sugars}
                </th>
                <td>
                </td>
              </tr>
              <tr className="thick-end">
                <th colSpan={2}>
                  <b>Protein </b>
                  {this.props.protein}
                </th>
                <td>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="small-info">* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs:</p>
        </section>
      </div>
    );
  }
}
