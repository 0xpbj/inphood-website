const React = require('react')
import Grid from 'react-bootstrap/lib/Grid'

export default class Layout extends React.Component {
  render() {
    return (
      <Grid fluid={true}>
        {this.props.children}
      </Grid>
    )
  }
}
