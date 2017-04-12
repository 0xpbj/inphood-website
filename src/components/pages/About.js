const React = require('react')
import ReactGA from 'react-ga'
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import instagram from '../../images/instagram.svg'
import linkedin from '../../images/linkedin.svg'
import {Link} from 'react-router'
import Footer from '../../containers/FooterContainer'
import TopBar from '../../containers/TopBarContainer'
import MarginLayout from '../../helpers/MarginLayout'

export default class About extends React.Component {
  componentWillMount() {
    // user did not come from home page
    if (this.props.router.location.action !== 'PUSH') {
      // send user back to home page
      this.props.router.push('/')
    }
  }
  getTeamMember(memberName, title, flag, instagramUrl, linkedInUrl) {
    // const pbj = require('../../images/PBJ.jpg')
    const pbj = require('../../images/PBJ_1.png')
    // const ayc = require('../../images/AC.jpg')
    const ayc = require('../../images/AC_1.png')
    const avatar = flag ? pbj : ayc
    return (
      <Row className="team-member">
        <img src={avatar} className="img-responsive img-circle" width="256" height="256" style={{borderRadius: 10, borderWidth: 2, borderStyle: 'solid', borderColor: 'black'}}/>
        <h3>{memberName}</h3>
        <p className="text-muted">{title}</p>
        <ul className="list-inline social-buttons">
          <li><Link to={instagramUrl} target="_blank"><i className="fa fa-instagram"><img src={instagram} className="App-logo" alt="logo" height={40} width={40} /></i></Link>
          </li>
          <li><Link to={linkedInUrl} target="_blank"><i className="fa fa-linkedin"><img src={linkedin} className="App-logo" alt="logo" height={40} width={40} /></i></Link>
          </li>
        </ul>
      </Row>
    )
  }
  render() {
    const ml = new MarginLayout()
    ReactGA.event({
      category: 'User',
      action: 'User visited about page',
      nonInteraction: false
    });
    return (
      <Row>
      <TopBar router={this.props.router}/>
        <Row style={{backgroundColor:'white'}}>
          {ml.marginCol}
          <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
            <Row>
              <h1 className="page-header">About Us</h1>
              <h4>inPhood Inc. founded in 2016, labels food images across the internet.</h4>
              <h4>Our products help users generate shareable nutrition labels, based on USDA information and proprietary sources.</h4>
              <h2 className="page-header">Our Team</h2>
            </Row>
            <Row>
              <Col sm={6}>
                {this.getTeamMember("Prabhaav Bhardwaj", "CEO",
                  true,
                  "https://www.instagram.com/pv.bj",
                  "https://www.linkedin.com/in/prabhaav"
                )}
              </Col>
              <Col sm={6}>
                {this.getTeamMember("Alex Carreira", "CTO",
                  false,
                  "https://www.instagram.com/ac4tw",
                  "https://www.linkedin.com/in/alex-carreira-6a2a711"
                )}
              </Col>
            </Row>
          </Col>
          {ml.marginCol}
        </Row>
        <Row style={{height:'38vh'}}/>
        <Footer fullPage={true} router={this.props.router}/>
      </Row>
    )
  }
}
