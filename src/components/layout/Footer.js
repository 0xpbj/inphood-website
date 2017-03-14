const React = require('react')
import ReactGA from 'react-ga'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import EmailForm from '../pages/EmailForm'
import {Link} from 'react-router'

export default class Footer extends React.Component {
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
      ReactGA.event({
        category: 'User',
        action: 'User sent email',
        nonInteraction: false
      });
      this.props.initEmailFlow()
      this.props.getEmailData(this.state.data)
    }
  }
  render() {
    const currentYear = new Date().getFullYear()
    let open  = () => this.setState({ show: true })
    let close = () => this.setState({ show: false })
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
                  <Button bsStyle="info" onClick={open}>
                    Contact Us&nbsp;&nbsp;<Glyphicon glyph="glyphicon glyphicon-envelope" /> 
                  </Button>
                  <Modal show={this.state.show} bsSize="small" aria-labelledby="contained-modal-title-sm">
                    <Modal.Header>
                      <Modal.Title id="contained-modal-title-sm">Contact Us</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <EmailForm 
                        data={(data) => this.getData(data)}
                      /> 
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={this.onSubmit.bind(this)}>Submit</Button>
                    </Modal.Footer>
                  </Modal>
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