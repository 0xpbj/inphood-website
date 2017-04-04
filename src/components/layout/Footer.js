const React = require('react')
import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import MarginLayout from '../../helpers/MarginLayout'

export default class Footer extends React.Component {
  render() {
    const ml = new MarginLayout()
    const currentYear = new Date().getFullYear()
    return (
      <Row
        style={{borderWidth:0,
                borderBottomWidth:1,
                borderColor:'gray',
                borderStyle:'solid',
                backgroundColor:'rgba(0,0,0,0.25)',
                padding:10}}>
        {ml.marginCol}
        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <p className="text-center"> Copyright &copy; {currentYear} inPhood Inc., All rights reserved.</p>
        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
