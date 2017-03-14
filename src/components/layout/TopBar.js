const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import {Link} from 'react-router'
import MarginLayout from '../../helpers/MarginLayout'

export default class TopBar extends React.Component {
  render() {
    const ml = new MarginLayout()
    const step = this.props.step
    const stepText = this.props.stepText
    const altContent = this.props.altContent
    const aButton = this.props.aButton

    // let centerContent = (<Col xs={12} sm={6}/>)
    // if (step != "" && stepText != "") {
    //   /* Hack: rather than use flex or other things that cause the display to
    //     not respond well to massive size changes, we use this marginTop setting
    //     to align the text to the bottom with the other elements */
    //   centerContent = (
    //     <Col xs={12} sm={6} className="text-center" style={{marginTop: 35-20}}>
    //         <text><h4 style={{margin: 0}}><b>Step {step}: </b>{stepText}</h4></text>
    //     </Col>
    //   )
    // } else if (altContent != "") {
    //   centerContent = (
    //     <Col xs={12} sm={6} className="text-center">
    //       {altContent}
    //     </Col>
    //   )
    // }
    let centerContent = (
      <Col xs={12} sm={6} className="text-center">
        {altContent}
      </Col>
    )

    return (
      <Row style={{marginLeft: 0,
                   marginRight: 0,
                   marginBottom: 30,
                   padding: 5,
                   borderBottomStyle: 'solid',
                   borderWidth: 1,
                   borderColor: 'black'}}>
        {ml.marginCol}
        <Col xs={ml.xsCol}
             sm={ml.smCol}
             md={ml.mdCol}
             lg={ml.lgCol}>
          <Row>
            <Col xs={12} sm={3} style={{paddingLeft: 0, paddingRight: 0}}>
              <Link to="http://www.inphood.com"><img src={require('../../images/logoSmall.png')} width="147" height="35"/></Link>
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
