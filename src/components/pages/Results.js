var React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Label from './NutritionEstimateJSX'
import {Link} from 'react-router'
import {IngredientModel} from '../models/IngredientModel'
import TagController from '../controllers/TagController'
import CopyToClipboard from 'react-copy-to-clipboard';

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      copied: false,
      ecopied: false
    }
  }
  componentWillMount() {
    this.props.getLabelId(this.props.params.userId, this.props.params.labelId)
  }
  // From https://toddmotto.com/methods-to-determine-if-an-object-has-a-given-property/
  //  - addresses limitations of IE and other issues related to checking if an object
  //    has a property.
  //
  hasProp(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }
  loadTags() {
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.props.results.data === null) {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.props.router.push('/')}>
          <h4>Oh snap! Label not found!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.props.router.push('/')}>Go Home</Button>
          </p>
        </Alert>
      )
    }
    else {
      const socialContainerStyle = {
        marginTop: "20px",
        border: "2px solid black",
        padding: "5px",
        margin: "10px",
      }
      const labelContainerStyle = {
        marginTop: "20px",
        border: "2px solid black",
        padding: "5px",
        margin: "10px",
      }
      const image = this.props.params.userId === 'anonymous'
      ? <Image src={this.props.results.data.oUrl} responsive rounded/>
      : (
          <Link to={'http://www.instagram.com/p/' + this.props.results.data.key} target="_blank">
            <Tooltip placement="top" className="in" id="tooltip-top">
              @{this.props.params.userId}
            </Tooltip>
            <Image src={this.props.results.data.oUrl} responsive rounded/>
          </Link>
      )
      const credit = this.props.params.userId === 'anaonymous' ? (
        <div style={socialContainerStyle}>
          Picture Credit: Anonymous
        </div>
      ) : ( 
        <div style={socialContainerStyle}>
          Picture Credit: <Link to={'http://www.instagram.com/' + this.props.params.userId} target="_blank">{this.props.params.userId}</Link>
        </div>
      )
      let textLabel = ''
      // If we've received the data for the Nutrition label, deserialize it for
      // rendering, otherwise display a loading message.
      //   - TODO: make the loading message suck less
      let nutritionLabel = <text> Loading ...</text>
      if (this.hasProp(this.props.results.data, 'composite')) {
        let ingredientData = JSON.parse(this.props.results.data.composite)
        let ingredient = new IngredientModel()
        ingredient.initializeFromSerialization(ingredientData)
        console.log(ingredient)
        textLabel = 'Serving Size : ' + ingredient.getServingAmount() + ' ' + ingredient.getServingUnit() +
                    '\nCalories     : ' + ingredient.getCalories() + 
                    '\nFat          : ' + ingredient.getTotalFatPerServing() + ' ' +  ingredient.getTotalFatUnit() + 
                    '\nCarbs        : ' + ingredient.getTotalCarbohydratePerServing() + ' ' + ingredient.getTotalCarbohydrateUnit() +
                    '\nFiber        : ' + ingredient.getDietaryFiber() + ' ' + ingredient.getDietaryFiberUnit() +
                    '\nProtein      : ' + ingredient.getTotalProteinPerServing() + ' ' + ingredient.getTotalProteinUnit() +
                    '\nSugars       : ' + ingredient.getSugars() + ' ' + ingredient.getSugarsUnit() +
                    '\nSodium       : ' + ingredient.getSodium() + ' ' + ingredient.getSodumUnit()
        nutritionLabel = <Label ingredientComposite={ingredient}/>
      }
      const path = 'http://www.label.inphood.com/?user=' + this.props.params.userId + '&label=' + this.props.params.labelId + '&embed=false'
      const epath = 'http://www.label.inphood.com/?user=' + this.props.params.userId + '&label=' + this.props.params.labelId + '&embed=true'
      const recipe = <pre>{this.props.results.data.rawData}</pre>
      const {selectedTags} = this.props.results.data
      const tags = selectedTags ? (
        <TagController
          tags={selectedTags}
          tagName={'Ingredient Tags:'}
          clean={true}
        /> ) : null
      const label = (
        <Grid>
          <div>
          <Row className="show-grid">
            <Col xs={4} md={4}>
              <div className="text-center"><ControlLabel>Text Label</ControlLabel></div>
              <pre>{textLabel}</pre>
            </Col>
            <Col xs={5} md={5}>
              <div className="text-center"><ControlLabel>Nutrition Label</ControlLabel></div>
                {nutritionLabel}
            </Col>
            <Col xs={3} md={3}>
              <div className="text-center"><ControlLabel>Shareable Links</ControlLabel>
              <div style={containerStyle} />
              <CopyToClipboard text={path}
                onCopy={() => this.setState({copied: true, ecopied: false})}>
                <Button className="btn-primary-spacing" bsStyle="success">
                  Share URL&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-share"></Glyphicon>
                </Button>
              </CopyToClipboard>
              {this.state.copied ? <span style={{color: 'red'}}>&nbsp;Copied.</span> : null}
              <div style={containerStyle} />
              <CopyToClipboard text={epath}
                onCopy={() => this.setState({ecopied: true, copied: false})}>
                <Button className="btn-primary-spacing" bsStyle="success">
                  Embed URL&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-edit"></Glyphicon>
                </Button>
              </CopyToClipboard>
              {this.state.ecopied ? <span style={{color: 'red'}}>&nbsp;Copied.</span> : null}
              </div>
            </Col>
          </Row>
          </div>
        </Grid>
      )
      return label
    }
  }
}
