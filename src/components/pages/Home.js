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
import TopBar from '../layout/TopBar'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
const Config = require('Config')
export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      showUploadModal: false,
      showHelp: false
    }
  }
  componentWillMount() {
    if (this.props.user.anonymous)
      this.props.anClearData()
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.anonymous !== nextProps.user.anonymous)
      this.setState({anonymous: nextProps.user.anonymous})
  }
  onDrop(acceptedFiles, rejectedFiles) {
    ReactGA.event({
      category: 'User',
      action: 'Image upload flow initiated',
      label: 'Local Image Flow',
      nonInteraction: false
    })
    acceptedFiles.forEach(file => {
      this.props.anSelectedPhoto(file)
    })
    this.props.router.push('image')
  }
  render() {
    const images = [
      { 
        original: require('../../images/howto/select.jpg'),
        description: 'Select a meal photo'
      },
      { 
        original: require('../../images/howto/recipe.jpg'),
        description: 'Write recipe details'
      },
      { 
        original: require('../../images/howto/mixers.jpg'),
        description: 'Mix ingredient quantites'
      }
    ]
    const {showHelp, showUploadModal, lightboxIsOpen} = this.state
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
              {/*<Button onClick={this.handleClick.bind(this)}>Sign in with Instagram</Button>*/}
              <Button bsStyle="default" onClick={()=>this.setState({ showUploadModal: true })}>
                Upload Photo&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-open"></Glyphicon>
              </Button>
              <UploadModal
                onDrop={(acceptedFiles, rejectedFiles) => this.onDrop.bind(this)}
                show={showUploadModal}
                onHide={() => this.setState({showUploadModal: false})}
              />
            </div>
          </Row>
        </Grid>
      </div>
    )
  }
}
