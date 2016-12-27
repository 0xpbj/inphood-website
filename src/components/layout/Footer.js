import React from "react"

export default class Footer extends React.Component {
  render() {
    const containerStyle = {
      marginTop: "60px"
    }
    return (
      <footer>
        <div className="row" style={containerStyle}>
          <div className="col-lg-12">
            <p className="text-center">Copyright &copy; inPhood Inc.,</p>
          </div>
        </div>
      </footer>
    )
  }
}