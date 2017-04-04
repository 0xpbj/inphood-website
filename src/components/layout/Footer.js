const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import MarginLayout from '../../helpers/MarginLayout'

import {Link} from 'react-router'

export default class Footer extends React.Component {
  render() {
    const ml = new MarginLayout()
    const currentYear = new Date().getFullYear()

    const {router} = this.props
    
    const whiteBackground={
      backgroundColor:'white'
    }

    return (
      <Row style={whiteBackground}>
        {ml.marginCol}

        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <Row>
            <Col xs={6} className='text-right'>
              <Button bsStyle="link" onClick={() => router.push('/about')}>
                About Us
              </Button>
            </Col>
            <Col xs={6} className='text-left'>
              <Button bsStyle="link">
                <Link to="http://www.inphood.com/privacy_policy.pdf" target="_blank">Privacy Policy</Link>
              </Button>
            </Col>
            <Col xs={12} className='text-center'>
              <h5 className="text-center">
                Copyright &copy; {currentYear} inPhood Inc., All rights reserved.
              </h5>
            </Col>
            {/* Workaround: whitespace to cause the white bar at the bottom to
                extend over the image at the bottom when max size.*/}
            <Col xs={12}>&nbsp;</Col>
            <Col xs={12}>&nbsp;</Col>
          </Row>
        </Col>

        {ml.marginCol}
      </Row>
    )
  }
}
