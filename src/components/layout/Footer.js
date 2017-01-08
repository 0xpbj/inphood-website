var React = require('react')

export default class Footer extends React.Component {
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    const currentYear = new Date().getFullYear()
    return (
      <footer>
        <div className="row" style={containerStyle}>
          <div className="col-lg-12">
            <p className="text-center"> &copy; Copyright {currentYear} inPhood Inc., All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
}
