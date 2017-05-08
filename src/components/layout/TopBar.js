const React = require('react')
// import ReactGA from 'react-ga'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import MarginLayout from '../../helpers/MarginLayout'

import {Link} from 'react-router'
import EmailForm from '../pages/EmailForm'

export default class TopBar extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false,
      data: ''
    }
  }
  getData(data) {
    this.setState({data})
    event.preventDefault()
  }
  onSubmit() {
    this.setState({ show: false })
    if (this.state.data !== '') {
      // ReactGA.event({
      //   category: 'User',
      //   action: 'User sent email',
      //   nonInteraction: false
      // });
      this.props.initEmailFlow()
      this.props.getEmailData(this.state.data)
    }
  }
  render() {
    let open  = () => this.setState({ show: true })
    let close = () => this.setState({ show: false })
    const ml = new MarginLayout()
    const {router, transparent, loginRed} = this.props
    const whiteBackground = transparent ?
    {
      borderWidth:0, borderBottom:1, borderColor:'gray', borderStyle:'solid',
      backgroundColor:'rgba(255,255,255,0.0)'
    } :
    {
      borderWidth:0, borderBottom:1, borderColor:'gray', borderStyle:'solid',
      backgroundColor:'rgba(255,255,255,0.85)'
    }
    const logout = loginRed.result === 'anonymous' ? 'Anonymous' : 'Log Out'
    const loginButton = loginRed.result ? (
      <Button bsStyle="link" onClick={() => this.props.promptLogout()} style={{fontSize: 20, marginTop: 20}}>
        <Glyphicon glyph="glyphicon glyphicon-log-out" />&nbsp;&nbsp;{logout}
      </Button>
    ) : (
      <Button bsStyle="link" onClick={() => this.props.initLogin()} style={{fontSize: 20, marginTop: 20}}>
        <Glyphicon glyph="glyphicon glyphicon-log-in" />&nbsp;&nbsp;Log In
      </Button>
    )
    return (
      <Row style={whiteBackground}>
        {ml.marginCol}
        <Col xs={ml.xsCol} sm={ml.smCol} md={ml.mdCol} lg={ml.lgCol}>
          <Row>
            <Col style={{paddingLeft: 0, paddingRight: 0}} xs={6}>
              <Button bsStyle="link" onClick={() => router.push('/')}>
                <img src={require('../../images/logoOnClear.png')}/>
              </Button>
            </Col>
            <Col className='text-right' xs={6}>
              <Row>
              <Col xs={3}/>
              <Col xs={3}>
                <Button bsStyle="link" onClick={open} style={{fontSize: 20, marginTop: 20}}>
                  <Glyphicon glyph="glyphicon glyphicon-comment" />&nbsp;&nbsp;Suggestions?
                </Button>
              </Col>
              <Col xs={2}/>
              <Col xs={3}>
                {loginButton}
              </Col>
              <Modal onHide={close} show={this.state.show} bsSize="small" aria-labelledby="contained-modal-title-sm">
                <Modal.Header>
                  <Modal.Title id="contained-modal-title-sm">How can we help?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <EmailForm data={(data) => this.getData(data)}/>
                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={this.onSubmit.bind(this)}>Submit</Button>
                </Modal.Footer>
              </Modal>
              <Col xs={1}/>
              </Row>
            </Col>
          </Row>
        </Col>
        {ml.marginCol}
      </Row>
    )
  }
}
