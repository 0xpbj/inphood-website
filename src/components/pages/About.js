var React = require('react')
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'

export default class About extends React.Component {

  getTeamMember(memberName, title, imageUrl, instagramUrl, linkedInUrl) {
    return (
      <div className="team-member">
        <img src={imageUrl} className="img-responsive img-circle" width="200" height="200" />
        <h4>{memberName}</h4>
        <p className="text-muted">{title}</p>
        <ul className="list-inline social-buttons">
          <li><a href={instagramUrl}><i className="fa fa-instagram">Instagram</i></a>
          </li>
          <li><a href={linkedInUrl}><i className="fa fa-linkedin">LinkedIn</i></a>
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
                  "http://static.wixstatic.com/media/1ca336_3823dd5c039244e8bb5c27abc51cbc90~mv2_d_1400_1400_s_2.jpg",
                  "https://www.instagram.com/t3zcat",
                  "https://www.linkedin.com/in/prabhaav"
                )}
              </div>
              <div className="col-sm-6">
                {this.getTeamMember("Alex Carreira", "CTO",
                  "http://www.theartofdoingstuff.com/wp-content/uploads/2013/03/Banana.jpg",
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
