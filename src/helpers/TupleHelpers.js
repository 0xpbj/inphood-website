

// TODO: put this somewhere sensible:
//
//  Takes a list of [[a, b, c], [d, e, f] ...] and returns a new list containing
//  elements of the specified tuple offset--i.e. given offset 1, it would return
//  [b, e] for the example given above.
//
export function getListOfTupleOffset(listOfTuples, offset) {
  if ((listOfTuples.length <= 0) ||
      (listOfTuples[0].length <= offset)) {
    return []
  }

  let listOfTupleOffset = []
  for (let idx = 0; idx < listOfTuples.length; idx++) {
    listOfTupleOffset.push(listOfTuples[idx][offset])
  }

  return listOfTupleOffset
}

export function getIndexForDescription(listOfTuples, description) {
  // TODO: unify these somewhere - DRY
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2

  for (let idx = 0; idx < listOfTuples.length; idx++) {
    if (listOfTuples[idx][descriptionOffset] === description) {
      return idx
    }
  }

  return -1
}

export function getTupleForDescription(listOfTuples, description) {
  let index = getIndexForDescription(listOfTuples, description)

  if (index < 0) {
    return null
  }

  return listOfTuples[index]
}

export function getDataForDescription(listOfTuples, description) {
  // TODO: unify these somewhere - DRY
  // Tuple offsets for firebase data in nutrition reducer:
  const descriptionOffset = 0
  const keyOffset = 1
  const dataObjOffset = 2

  let tuple = getTupleForDescription(listOfTuples, description)
  if (tuple === null) {
    return null
  }

  return tuple[dataObjOffset]
}