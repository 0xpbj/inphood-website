const React = require('react')
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Chip from 'react-toolbox/lib/chip'

export default class TagController extends React.Component {
  getChipsFromArray(anArray, deletable, handleChipAdd, clean) {
    let htmlResult = []
    for (let i = 0; i < anArray.length; i++) {
      let tag = anArray[i]
      if (clean) {
        htmlResult.push(
        <Chip
          onDeleteClick={() => handleChipAdd(tag)}>
          <span>
            {tag}
          </span>
        </Chip>)
      }
      else if (deletable) {
        htmlResult.push(
        <Chip
          onDeleteClick={() => handleChipAdd(tag)}
          deletable>
          <span style={{textDecoration: 'line-through'}}>
            {tag}
          </span>
        </Chip>)
      }
      else {
        htmlResult.push(
        <Chip
          onDeleteClick={() => handleChipAdd(tag)}>
          <span style={{textDecoration: 'line-through'}}>
            {tag}
          </span>
        </Chip>)
      }
    }
    return (
      <div>{htmlResult}</div>
    )
  }
  render() {
    const {tags, tagName, deletable, handleChipAdd, clean} = this.props
    if (tags.length === 0) {
      return (<div></div>)
    }
    return (
      <div>
        <Row>
          <Col xs={12} md={12}>
            <text style={{fontWeight: 'bold'}}>{tagName}</text>
          </Col>
        </Row>
        <div style={{borderWidth: 1,
                     borderColor: 'black',
                     borderStyle: 'solid',
                     borderRadius: 5,
                     padding: 10,
                     marginRight: 10,
                     marginLeft: 10}}>
          <Row>
            <Col xs={12} md={12}>
              {this.getChipsFromArray(tags, deletable, handleChipAdd, clean)}
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}