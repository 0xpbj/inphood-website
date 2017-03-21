const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Grid from 'react-bootstrap/lib/Grid'

import Footer from "../../containers/FooterContainer"

export default class Layout extends React.Component {
  render() {
    const { location } = this.props
    return (
      <div>
        <Grid>
          <Row>
            <div className="row">
              <div className="col-lg-12">
                {this.props.children}
              </div>
            </div>
          </Row>
          <Row>
            <Footer/>
          </Row>
        </Grid>
      </div>
    )
  }
}
