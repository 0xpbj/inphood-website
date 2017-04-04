const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import MarginLayout from '../../helpers/MarginLayout'

export default class Footer extends React.Component {
  render() {
    const ml = new MarginLayout()
    const currentYear = new Date().getFullYear()
    return (
      <Row>
        {ml.marginCol}
        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <h4 className="text-center">
            <b>Copyright &copy; {currentYear} inPhood Inc., All rights reserved.</b>
          </h4>
        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
