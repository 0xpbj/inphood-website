var React = require('react')
import { Link } from "react-router"

export default class Nav extends React.Component {
  constructor() {
    super()
    this.state = {
      collapsed: true,
    }
  }
  toggleCollapse() {
    const collapsed = !this.state.collapsed
    this.setState({collapsed})
  }
  render() {
    const { collapsed } = this.state
    const navClass = collapsed ? "collapse" : ""
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" onClick={this.toggleCollapse.bind(this)} >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <div className={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li>
                <Link 
                  to="/"
                  onClick={this.toggleCollapse.bind(this)}
                  className="home-link"
                  activeClassName="active"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about"
                  onClick={this.toggleCollapse.bind(this)}
                  className="about-link"
                  activeClassName="active"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}
