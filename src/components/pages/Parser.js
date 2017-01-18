var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Button from 'react-bootstrap/lib/Button'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

export default class Parser extends React.Component {
  constructor() {
    super()
    this.state = {
      parse: false,
      ingredients: ''
    }
  }
  switchSpecial(s) {
    switch(s) {
      case "½":
        return "1/2"
      case "⅓":
        return "1/3"
      case "⅔":
        return "2/3"
      case "¼":
        return "1/4"
      case "¾":
        return "3/4"
      case "⅕":
        return "1/5"
      case "⅖":
        return "2/5"
      case "⅗":
        return "3/5"
      case "⅘":
        return "4/5"
      case "⅙":
        return "1/6"
      case "⅚":
        return "5/6"
      case "⅛":
        return "1/8"
      case "⅜":
        return "3/8"
      case "⅝":
        return "5/8"
      case "⅞":
        return "7/8"
      default:
        return s
    }
  }
  removeSpecialChars(str) {
    const regex = /(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)/g
    if (str.match(regex) === null)
      return str
    let clean = ''
    let index = []
    let match
    while ((match = regex.exec(str)) != null) {
      index.push(match.index)
    }
    let m = 0
    for (let i = 0; i < str.length; i++) {
      if (index.length > 0 && i === index[m]) {
        clean += this.switchSpecial(str[i])
        m++
      }
      else {
        clean += str[i]
      }
    }
    return clean
  }
  parseData() {
    let regex = /[^\r\n]+/g
    let phrases = this.state.ingredients.match(regex)
    var ingp = require('../../algorithms/parser/ingredientparser')
    for (let i of phrases) {
      let clean = this.removeSpecialChars(i)
      let parsed = ingp.parse(clean)
      console.log('Parsed: ', parsed)
    }
    // this.setState({amounts, units, names})
  }
  getData(e) {
    let ingredients = e.target.value
    this.setState({ingredients})
  }
  render() {
    return (
      <FormGroup controlId="formControlsTextarea">
        <ControlLabel>Recipe</ControlLabel>
        <FormControl componentClass="textarea" rows="10" placeholder="Write recipe here..." onChange={this.getData.bind(this)}/>
      </FormGroup>
    )
  }
}
