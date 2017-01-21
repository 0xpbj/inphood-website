var React = require('react')
import Col from 'react-bootstrap/lib/Col'
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'
import Alert from 'react-bootstrap/lib/Alert'

export default class About extends React.Component {
  render() {
    return (
      <Grid>
        <Row className="show-grid">
          <h1 className="page-header">About Us</h1>
          <p>Nutrition information provider for home cooked meals</p>
          <h2 className="page-header">Our Team</h2>
            <div className="row">
              <div className="col-sm-6">
                <div className="team-member">
                  <img src="http://static.wixstatic.com/media/1ca336_3823dd5c039244e8bb5c27abc51cbc90~mv2_d_1400_1400_s_2.jpg" className="img-responsive img-circle" width="200" height="200" />
                  <h4>Prabhaav Bhardwaj</h4>
                  <p className="text-muted">CEO</p>
                  <ul className="list-inline social-buttons">
                    <li><a href="#"><i className="fa fa-instagram"></i></a>
                    </li>
                    <li><a href="#"><i className="fa fa-linkedin"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="team-member">
                  <img src="http://www.theartofdoingstuff.com/wp-content/uploads/2013/03/Banana.jpg" className="img-responsive img-circle" width="200" height="200" />
                  <h4>Alex Carreira</h4>
                  <p className="text-muted">CTO</p>
                  <ul className="list-inline social-buttons">
                    <li><a href="#"><i className="fa fa-instagram"></i></a>
                    </li>
                    <li><a href="#"><i className="fa fa-linkedin"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </Row>
      </Grid>
    )
  }
}
