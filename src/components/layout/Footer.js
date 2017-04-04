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
    return (
      <Row>
        {ml.marginCol}
        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <Row>
            <Col xs={12} sm={9}>
              <h4 className="text-center" style={{color:'black'}}>
                Copyright &copy; {currentYear} inPhood Inc., All rights reserved.
              </h4>
            </Col>
            <Col className="text-center" xs={12} sm={3}>
              <Button bsStyle="link" style={{color:'black'}}>
                <Link to="http://www.inphood.com/privacy_policy.pdf" target="_blank">Privacy Policy&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-briefcase" /></Link>
              </Button>
            </Col>
          </Row>
        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
