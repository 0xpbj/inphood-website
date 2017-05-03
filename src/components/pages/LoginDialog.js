const React = require('react')
import ReactGA from 'react-ga'
const Config = require('Config')
import Dialog from 'react-toolbox/lib/dialog'
import {Button} from 'react-toolbox/lib/button'
import Input from 'react-toolbox/lib/input'

export default class LoginDialog extends React.Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: ''
    }
  }
  actions = []
  componentWillMount() {
    this.actions = [
      { label: "Cancel", onClick: () => this.props.handleLoginToggle() },
      { label: "Save", onClick: () => this.props.handleLoginToggle() }
    ]
  }
  componentWillReceiveProps(nextProps) {
  }
  handleChange (name, value) {
    this.setState({...this.state, [name]: value})
  }
  render () {
    return (
      <div>
        <Dialog
          actions={this.actions}
          active={this.props.active}
          onEscKeyDown={() => this.props.handleLoginToggle()}
          onOverlayClick={() => this.props.handleLoginToggle()}
          title='Login Dialog'
        >
          <section>
            <Input type='email' label='Email address' icon='email' value={this.state.email} onChange={this.handleChange.bind(this, 'email')} />
            <Input type='password' label='Password' icon='fingerprint' value={this.state.password} onChange={this.handleChange.bind(this, 'password')} />
          </section>
        </Dialog>
      </div>
    )
  }
}
