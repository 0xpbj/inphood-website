const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Button from 'react-bootstrap/lib/Button'
import MarginLayout from '../../helpers/MarginLayout'

export default class TopBar extends React.Component {
  render() {
    const ml = new MarginLayout()
    const {step, stepText, altContent, aButton, router} = this.props
    let centerContent = (
      <Col xs={12} sm={6} className="text-center">
        {altContent}
      </Col>
    )
    return (
      <Row style={{marginLeft: 0,
                   marginRight: 0,
                   marginBottom: 30,
                   padding: 5}}>
        {ml.marginCol}
        <Col xs={ml.xsCol}
             sm={ml.smCol}
             md={ml.mdCol}
             lg={ml.lgCol}>
          <Row>
            <Col xs={12} sm={3} style={{paddingLeft: 0, paddingRight: 0}}>
              <Button bsStyle="link" onClick={() => router.push('/')}>
                <img src={require('../../images/logoSmall.png')} width="147" height="35"/>
              </Button>
            </Col>
            {centerContent}
            <Col xs={12} sm={3} className="text-right" style={{paddingLeft: 0, paddingRight: 0, marginTop: 1}}>
              {aButton}
            </Col>
          </Row>
        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
