var React = require('react')
import Alert from 'react-bootstrap/lib/Alert'
import Button from 'react-bootstrap/lib/Button'
import {Redirect} from 'react-router'

export default class Results extends React.Component {
  constructor() {
    super()
    this.state = {
      goHome: false
    }
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    if (this.state.goHome) {
      return <Redirect to="/" />
    }
    else {
      return (
        <Alert bsStyle="danger" onDismiss={() => this.setState({goHome: true})}>
          <h4>Oh snap! Page not found!</h4>
          <p>
            <Button bsStyle="danger" onClick={() => this.setState({goHome: true})}>Go Home</Button>
          </p>
        </Alert>
      )
    }
  }
}
