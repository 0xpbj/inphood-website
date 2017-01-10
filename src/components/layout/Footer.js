var React = require('react')

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
                        <li><i className="fa fa-envelope-o fa-fw"></i> <a href="mailto:info@inphood.com">info@inphood.com</a>
                        </li>
                    </ul>
                    <p className="text-center"> Copyright &copy; {currentYear} inPhood Inc., All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    )
  }
}
