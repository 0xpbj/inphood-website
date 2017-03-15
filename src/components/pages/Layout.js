const React = require('react')

import Footer from "../../containers/FooterContainer"
// import Nav from "../layout/Nav"

export default class Layout extends React.Component {
  render() {
    const { location } = this.props
    return (
      <div>
        <div>
          <div className="row">
            <div className="col-lg-12">
              {this.props.children}
            </div>
          </div>
          <Footer/>
        </div>
      </div>
    )
  }
}
