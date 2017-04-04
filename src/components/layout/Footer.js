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
      borderWidth:0,
      borderRadius:15,
      backgroundColor:'rgba(0,0,0,0.6)',
    }
    const fillerCol=(<Col xs={0} sm={3} md={3} lg={4}/>)
    return (
      <Row>
        {fillerCol}

        <Col xs={12} sm={6} md={6} lg={4}>
          <Row style={whiteBackground}>
                <Col xs={12} className='text-center'>
                  <Button bsStyle="link" onClick={() => router.push('/about')}>
                    About Us
                  </Button>
                  <Button bsStyle="link">
                    <Link to="http://www.inphood.com/privacy_policy.pdf" target="_blank">Privacy Policy</Link>
                  </Button>
                </Col>
                <Col xs={12} className='text-center'>
                  <p className="text-center" style={{color:'gray'}}>
                    Copyright &copy; {currentYear} inPhood Inc., All rights reserved.
                  </p>
                </Col>
          </Row>
        </Col>

        {fillerCol}
      </Row>
    )
  }
}
