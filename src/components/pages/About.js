var React = require('react')
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'
import instagram from '../../data/instagram.svg'
import linkedin from '../../data/linkedin.svg'

export default class About extends React.Component {
  getTeamMember(memberName, title, flag, instagramUrl, linkedInUrl) {
    const pbj = require('../../images/PBJ.png')
    const ayc = require('../../images/AC.png')
    let avatar = flag ? pbj : ayc
    return (
      <div className="team-member">
        <img src={avatar} className="img-responsive img-circle" width="200" height="200" />
        <h4>{memberName}</h4>
        <p className="text-muted">{title}</p>
        <ul className="list-inline social-buttons">
          <li><a href={instagramUrl}><i className="fa fa-instagram"><img src={instagram} className="App-logo" alt="logo" height={40} width={40} /></i></a>
          </li>
          <li><a href={linkedInUrl}><i className="fa fa-linkedin"><img src={linkedin} className="App-logo" alt="logo" height={40} width={40} /></i></a>
          </li>
        </ul>
      </div>
    )
  }

  render() {
    return (
      <Grid>
        <Row className="show-grid">
          <h1 className="page-header">About Us</h1>
          <p>Purpose: Labeling food images across the internet</p>
          <p>Method:  Help users generate a shareable nutrition label based on the FDA database</p>
          <h2 className="page-header">Our Team</h2>
            <div className="row">
              <div className="col-sm-6">
                {this.getTeamMember("Prabhaav Bhardwaj", "CEO",
                  true,
                  "https://www.instagram.com/t3zcat",
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
