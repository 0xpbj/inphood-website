var React = require('react')

import Footer from "../layout/Footer"
// import Nav from "../layout/Nav"

export default class Layout extends React.Component {
  render() {
    const { location } = this.props
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <div>
        {/*<Nav location={location} />*/}
        <div className="container" style={containerStyle}>
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