const React = require('react')
import ReactGA from 'react-ga'
const Config = require('Config')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Button from 'react-bootstrap/lib/Button'
import Dialog from 'react-toolbox/lib/dialog'
import Input from 'react-toolbox/lib/input'
import { SocialIcon } from 'react-social-icons'

export default class LoginDialog extends React.Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: ''
    }
  }
  actions = [
    { label: "Cancel", onClick: () => this.props.cancelLogin() },
    { label: "Save", onClick: () => this.props.initLogin() }
  ]
  componentWillReceiveProps(nextProps) {
  }
  handleChange (name, value) {
    this.setState({...this.state, [name]: value})
  }
  render () {
    return (
      <Row>
        <Dialog
          actions={this.actions}
          active={this.props.loginRed.initLogin}
          onEscKeyDown={() => this.props.cancelLogin()}
          onOverlayClick={() => this.props.cancelLogin()}
          title='Login Dialog'
        >
          <Col md={6}>
            <Row style={{marginTop: 60}}>
              <Col xs={3}>
                <Button bsStyle="link" onClick={() => this.props.loginRequest(false)}>
                  <SocialIcon network="facebook"/>
                </Button>
              </Col>
              <Col xs={3}>
                <Button bsStyle="link" onClick={() => this.props.loginRequest(true)}>
                  <SocialIcon network="google"/>
                </Button>
              </Col>
              <Col xs={3}>
                <Button bsStyle="link" onClick={() => console.log('Twitter Login')}>
                  <SocialIcon network="twitter"/>
                </Button>
              </Col>
              <Col xs={3}>
                <Button bsStyle="link" onClick={() => console.log('Pinterest Login')}>
                  <SocialIcon network="pinterest"/>
                </Button>
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <Input type='email' label='Email address' icon='email' value={this.state.email} onChange={this.handleChange.bind(this, 'email')} />
            <Input type='password' label='Password' icon='fingerprint' value={this.state.password} onChange={this.handleChange.bind(this, 'password')} />
          </Col>
        </Dialog>
      </Row>
    )
  }
}
