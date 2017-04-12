const React = require('react')

import Modal from 'react-bootstrap/lib/Modal'
import Dropzone from 'react-dropzone'

export default class UploadModal extends React.Component {
  constructor() {
    super()
    this.state = {
      show: false
    }
  }
  render() {
    return (
      <Modal {...this.props} bsSize="small" aria-labelledby="contained-modal-title-sm">
        <Dropzone multiple={false} accept={'image/*'}style = {{ width: 300, height: 300, borderStyle: 'dashed'}} onDrop={this.props.onDrop()}>
          <Row style={{height: 110}} />
          <Row className="text-center">
            <h3 style={{color: 'grey'}}>Click Here | Drag Image</h3>
          </Row>
        </Dropzone>
      </Modal>
    )
  }
}