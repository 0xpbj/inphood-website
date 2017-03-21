const React = require('react')
import ReactGA from 'react-ga'
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import instagram from '../../images/instagram.svg'
import linkedin from '../../images/linkedin.svg'
import {Link} from 'react-router'

export default class About extends React.Component {
  getTeamMember(memberName, title, flag, instagramUrl, linkedInUrl) {
    const pbj = require('../../images/PBJ.jpg')
    const ayc = require('../../images/AC.jpg')
    const avatar = flag ? pbj : ayc
    return (
      <div className="team-member">
        <img src={avatar} className="img-responsive img-circle" width="256" height="256" style={{borderRadius: 10, borderWidth: 2, borderStyle: 'solid', borderColor: 'black'}}/>
        <h3>{memberName}</h3>
        <p className="text-muted">{title}</p>
        <ul className="list-inline social-buttons">
          <li><Link to={instagramUrl} target="_blank"><i className="fa fa-instagram"><img src={instagram} className="App-logo" alt="logo" height={40} width={40} /></i></Link>
          </li>
          <li><Link to={linkedInUrl} target="_blank"><i className="fa fa-linkedin"><img src={linkedin} className="App-logo" alt="logo" height={40} width={40} /></i></Link>
          </li>
        </ul>
      </div>
    )
  }
  render() {
    ReactGA.event({
      category: 'User',
      action: 'User visited about page',
      nonInteraction: false
    });
    return (
      <Grid>
        <Row className="show-grid">
          <h1 className="page-header">About Us</h1>
          <h4>inPhood LLC founded in 2016, labels food images across the internet.</h4>
          <h4>Our products help users generate shareable nutrition labels, based on USDA information and proprietary sources.</h4>
          <h2 className="page-header">Our Team</h2>
            <div className="row">
              <div className="col-sm-6">
                {this.getTeamMember("Prabhaav Bhardwaj", "CEO",
                  true,
                  "https://www.instagram.com/7pvbj",
                  "https://www.linkedin.com/in/prabhaav"
                )}
              </div>
              <div className="col-sm-6">
                {this.getTeamMember("Alex Carreira", "CTO",
                  false,
                  "https://www.instagram.com/ac4tw",
                  "https://www.linkedin.com/in/alex-carreira-6a2a711"
                )}
              </div>
            </div>
        </Row>
      </Grid>
    )
  }
}
