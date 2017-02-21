var React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import Image from 'react-bootstrap/lib/Image'
import Button from 'react-bootstrap/lib/Button'
import Jumbotron from 'react-bootstrap/lib/Jumbotron'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import UploadModal from '../layout/UploadModal'
import MarginLayout from '../../helpers/MarginLayout'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
const Config = require('Config')
export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showHelp: false
    }
  }
  render() {
    const images = [
      { 
        original: require('../../images/howto/recipe.jpg'),
        description: 'Write recipe details'
      },
      { 
        original: require('../../images/howto/mixers.jpg'),
        description: 'Mix ingredient quantites'
      },
      { 
        original: require('../../images/howto/result.jpg'),
        description: 'Share your results'
      }
    ]
    const {showHelp} = this.state
    const jumbo = showHelp ? (
      <ImageGallery
        items={images}
        slideInterval={2000}
        showThumbnails={false}
        showFullscreenButton={false}
        showPlayButton={false}
        showNav={false}
        autoPlay={true}
        infinite={false}
        disableArrowKeys={false}
        showBullets={true}
        onImageLoad={this.handleImageLoad}/>
    ) : (
      <div>
        <h1 className="text-center">What's really in your food?</h1>
        <h3 className="text-center">Make nutrition labels in three easy steps!</h3>
        <p className="text-right">
          <Button bsStyle="primary" onClick={() => this.setState({showHelp: true})}>
            Learn more
          </Button>
        </p>
      </div>
    )
    return (
      <div>
        <Grid>
          <Jumbotron style={{}}>{jumbo}</Jumbotron>
          <Row>
            <div className="text-center">
              <Button bsStyle="default" onClick={() => this.props.router.push('recipe')}>
                Get Started&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-send"></Glyphicon>
              </Button>
            </div>
          </Row>
        </Grid>
      </div>
    )
  }
}
