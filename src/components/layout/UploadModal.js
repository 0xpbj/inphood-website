var React = require('react')

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
        <Dropzone style = {{ width: 300, height: 300, borderStyle: 'dashed'}} onDrop={this.props.onDrop()}>
          <div className="centered">
              Click or Drag to add a image file
          </div>
        </Dropzone>
      </Modal>
    )
  }
}