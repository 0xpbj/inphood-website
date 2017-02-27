var React = require('react')
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import EmailForm from '../../containers/EmailFormContainer'
import {Link} from 'react-router'

export default class Footer extends React.Component {
  constructor() {
    super()
    this.state = {
      message: false
    }
  }
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const currentYear = new Date().getFullYear()
    const message = this.state.message ? <EmailForm onSend = {() => this.setState({message: false})} /> : (
      <Button bsStyle="info" onClick={() => this.setState({message: true})}>
        <Glyphicon glyph="glyphicon glyphicon-envelope" /> Contact Us
      </Button>
    )
    return (
      <footer>
        <div>
          <div className="row">
            <div className="col-lg-10 col-lg-offset-1 text-center">
              <hr className="small"></hr>
              <h4><strong>inPhood Inc.,</strong>
              </h4>
              <ul className="list-unstyled">
                  <li><i className="fa fa-envelope-o fa-fw"></i>
                    {message}
                  </li>
              </ul>
              <Link style={{marginRight: 10}} to="http://www.inphood.com/about">About Us</Link>
              <Link to="http://www.inphood.com/privacy_policy.pdf" target="_blank">Privacy Policy</Link>
              <p className="text-center"> Copyright &copy; {currentYear} inPhood Inc., All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
