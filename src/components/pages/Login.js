const React = require('react')
import ReactGA from 'react-ga'
const Config = require('Config')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Dialog from 'react-toolbox/lib/dialog'
import Input from 'react-toolbox/lib/input'
import { SocialIcon } from 'react-social-icons'
import ProgressBar from 'react-toolbox/lib/progress_bar'

export default class LoginDialog extends React.Component {
  constructor() {
    super()
    this.state = {
      user: '',
      password: '',
      email: false
    }
  }
  actions = [
    { label: "Cancel", onClick: () => this.cancelLogin() },
    { label: "SignUp", onClick: () => this.emailLogin(true) },
    { label: "SignIn", onClick: () => this.emailLogin(false) }
  ]
  handleChange (name, value) {
    this.setState({...this.state, [name]: value})
  }
  cancelLogin() {
    this.props.cancelLogin()
    this.setState({user: '', password: '', email: false})
  }
  emailLogin(signup) {
    const {user, password} = this.state
    this.props.emailLogin(user, password, signup)
  }
  render () {
    const {error, inProgress} = this.props.loginRed
    const loginError = (error) ? (
      <Alert bsStyle="danger">
        <h4>{error.message}</h4>
      </Alert>
    ) : null
    const loginProgress = (inProgress && !error) ? (
      <Row className="text-center">
        <ProgressBar type='circular' mode='indeterminate' multicolor={true} />
      </Row>
    ) : null
    const dialog = this.state.email ? (
      <Dialog
        actions={this.actions}
        active={this.props.loginRed.initLogin}
        onEscKeyDown={() => this.cancelLogin()}
        onOverlayClick={() => this.cancelLogin()}
        title='Email Login'
      >
        {loginError}
        {loginProgress}
        <Input type='email' label='Email address' icon='email' value={this.state.user} onChange={this.handleChange.bind(this, 'user')} />
        <Input type='password' label='Password' icon='fingerprint' value={this.state.password} onChange={this.handleChange.bind(this, 'password')} />
      </Dialog>
    ) : (
      <Dialog
        active={this.props.loginRed.initLogin}
        onEscKeyDown={() => this.cancelLogin()}
        onOverlayClick={() => this.cancelLogin()}
        title='User Login'
        className='text-center'
      >
        {loginError}
        {loginProgress}
        <Row style={{marginTop: 35}} className='text-center'>
          <OverlayTrigger placement="top" overlay={<Tooltip id="facebook"><strong>Login with Facebook</strong></Tooltip>}>
            <Button bsStyle="link" onClick={() => this.props.loginRequest(1)}>
              <SocialIcon network="facebook"/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip id="google"><strong>Login with Google</strong></Tooltip>}>
            <Button bsStyle="link" onClick={() => this.props.loginRequest(2)}>
              <SocialIcon network="google"/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip id="twitter"><strong>Login with Twitter</strong></Tooltip>}>
            <Button bsStyle="link" onClick={() => this.props.loginRequest(3)}>
              <SocialIcon network="twitter"/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip id="email"><strong>Login with Email</strong></Tooltip>}>
            <Button bsStyle="link" onClick={() => this.setState({email: true})}>
              <SocialIcon network="email"/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip id="anonymous"><strong>Login Anonymously</strong></Tooltip>}>
            <Button bsStyle="link" onClick={() => this.props.anonymousFlow()}>
              <SocialIcon network="snapchat" color="red"/>
            </Button>
          </OverlayTrigger>
        </Row>
      </Dialog>
    )
    return (
      <Row>
        {dialog}
      </Row>
    )
  }
}
