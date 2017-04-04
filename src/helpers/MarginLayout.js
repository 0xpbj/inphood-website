import Col from 'react-bootstrap/lib/Col'

export default class MarginLayout {
  marginCol = null

  xsCol = null
  smCol = null
  mdCol = null
  lgCol = null

  constructor() {
    // The array represents # of columns for xs sm md lg xl:
    const xsOffset = 0
    const smOffset = 1
    const mdOffset = 2
    const lgOffset = 3

    const margins = [0.0, 1.0, 1.0, 2.0]

    let centers = []

    for (let margin of margins) {
      let center = 12.0 - (2.0*margin)
      centers.push(center)
    }

    this.marginCol = (<Col xs={margins[xsOffset]}
                           sm={margins[smOffset]}
                           md={margins[mdOffset]}
                           lg={margins[lgOffset]}/>)

    this.xsCol = centers[xsOffset]
    this.smCol = centers[smOffset]
    this.mdCol = centers[mdOffset]
    this.lgCol = centers[lgOffset]
  }
}
