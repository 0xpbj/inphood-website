var React = require('react')
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import {Link} from 'react-router'

export default class Footer extends React.Component {
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const currentYear = new Date().getFullYear()
    return (
      <footer>
        <div className="container">
            <div className="row">
                <div className="col-lg-10 col-lg-offset-1 text-center">
                    <hr className="small"></hr>
                    <h4><strong>inPhood Inc.,</strong>
                    </h4>
                    <ul className="list-unstyled">
                        <li><i className="fa fa-envelope-o fa-fw"></i>
                            <a href="mailto:info@inphood.com">
                              <Button bsStyle="info">
                                <Glyphicon glyph="glyphicon glyphicon-envelope" /> Contact Us
                              </Button>
                            </a>
                        </li>
                    </ul>
                    <Link to="http://www.inphood.com/about">About Us&nbsp;</Link>
                    <Link to="http://www.inphood.com/privacy_policy.pdf" target="_blank">&nbsp;&nbsp;Privacy Policy</Link>
                    <p className="text-center"> Copyright &copy; {currentYear} inPhood Inc., All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    )
  }
}
