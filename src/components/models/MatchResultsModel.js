export class SearchResult {
  constructor(description, ndbNo, displayDescription = '') {
    this._description = description
    this._ndbNo = ndbNo
    this._displayDescription = displayDescription

    //
    // The FDA has two databases from which we draw results:
    //  - USDA National Nutrient Database for Standard Reference
    //  - USDA Branded Food Products Database
    //
    // The data objects below correspond to these different sources:
    //
    this._stdRefDataObj = undefined
    this._brandedDataObj = undefined
  }

  getDescription() {
    return this._description
  }

  getDisplayDescription() {
    return this._displayDescription
  }

  getNdbNo() {
    return this._ndbNo
  }

  getStandardRefDataObj() {
    return this._stdRefDataObj
  }

  setStandardRefDataObj(aDataObj) {
    this._stdRefDataObj = aDataObj
  }

  getBrandedDataObj() {
    return this._brandedDataObj
  }

  setBrandedDataObj(aDataObj) {
    this._brandedDataObj = aDataObj
  }
}

// This data model:
//
//  MatchResultsModel: {
//    searchTerm1: [
//      SearchResult1,
//      SearchResult2,
//      ...
//    ]
//    ...
//    searchTermN: [
//      SearchResultM,
//      ..
//    ]
//  }
//
export class MatchResultsModel {
  constructor() {
    this._searches = {}
  }
  //////////////////////////////////////////////////////////////////////////////
  // Methods to manipulate searches:
  //   (A search is a key - value pair in a dictionary called _searches. The
  //    key - value pair is the searchTerm and SearchResult respectively.
  //)
  addSearch(aSearchTerm) {
    if (aSearchTerm in this._searches) {
      // throw new Error("Error, " + aSearchTerm + " already exists in searches.")
      return
    }

    this._searches[aSearchTerm] = []
  }

  removeSearch(aSearchTerm) {
    if (aSearchTerm in this._searches) {
      delete this._searches[aSearchTerm]
    }
  }

  getSearches() {
    return this._searches
  }

  getSearchTerms() {
    return Object.keys(this._searches)
  }

  getNumberOfSearches() {
    return Object.keys(this._searches).length
  }

  hasSearchTerm(aSearchTerm) {
    return (aSearchTerm in this._searches)
  }
  //////////////////////////////////////////////////////////////////////////////
  // Methods to SearchResult lists and SearchResult objects:
  //
  appendSearchResult(aSearchTerm, aSearchResult) {
    this._searches[aSearchTerm].push(aSearchResult)
  }

  // Private -- do not call outside of this class
  _setObject(aSearchTerm, anIndex, anObject) {
    // TODO: expand to detect if anObject is the standard ref or branded--they
    // arrive in different formats:
    //
    // if (isStandardRefObj(anObject)) {
    this._searches[aSearchTerm][anIndex].setStandardRefDataObj(anObject)
    // } else {
    // this._searches[aSearchTerm][anIndex].setBrandedDataObj(anObject)
    // }
  }

  defineSearchResultObject(aSearchTerm, anIndex, anObject) {
    this._setObject(aSearchTerm, anIndex, anObject)
  }

  defineSearchResultObjectForDesc(aSearchTerm, aDescription, anObject) {
    if (! this.hasResults(aSearchTerm)) {
      return false
    }

    for (let idx = 0; idx < this._searches[aSearchTerm].length; idx++) {
      if (this._searches[aSearchTerm][idx].getDescription() === aDescription) {
        this._setObject(aSearchTerm, idx, anObject)
        return true
      }
    }
    return false
  }

  hasResults(aSearchTerm) {
    return (aSearchTerm in this._searches)
  }

  getSearchResults(aSearchTerm) {
    if (aSearchTerm in this._searches) {
      return this._searches[aSearchTerm]
    }
    return undefined
  }

  getSearchResultsLength(aSearchTerm) {
    if (aSearchTerm in this._searches) {
      return this._searches[aSearchTerm].length
    }
    return 0
  }

  getSearchResultDescriptions(aSearchTerm) {
    if (aSearchTerm in this._searches) {
      const searchTermResults = this._searches[aSearchTerm]
      let descriptions = []
      for (let idx = 0; idx < searchTermResults.length; idx++) {
        //EMPHASIS TAGS STUFF HERE
        // descriptions.push(searchTermResults[idx].getDisplayDescription())
        descriptions.push(searchTermResults[idx].getDescription())
      }
      return descriptions
    }
    return undefined
  }

  getSearchResultByIndex(aSearchTerm, anIndex = 0) {
    if ((aSearchTerm in this._searches) &&
        (this._searches[aSearchTerm].length > anIndex)) {
      return this._searches[aSearchTerm][anIndex]
    }
  }

  getSearchResultByDesc(aSearchTerm, aDescription) {
    const idx = this.getIndexForDescription(aSearchTerm, aDescription)
    if (idx !== -1) {
      return this._searches[aSearchTerm][idx]
    }
    return undefined
  }

  getIndexForDescription(aSearchTerm, aDescription) {
    if (!this.hasResults(aSearchTerm)) {
      return -1
    }

    for (let idx=0; idx < this._searches[aSearchTerm].length; idx++) {
      if (this._searches[aSearchTerm][idx].getDescription() === aDescription) {
        return idx
      }
    }

    return -1
  }

  toString() {
    let objectStr = 'MatchResultsModel:\n'
    for (let searchTerm in this._searches) {
      objectStr += '   ' + searchTerm + ':\n'
      for (let searchResult of this._searches[searchTerm]) {
        objectStr += '   SearchResult:\n'
        objectStr += '      description: ' + searchResult.getDescription() + '\n'
        objectStr += '      ndbNo: ' + searchResult.getNdbNo() + '\n'
        objectStr += '      stdRevDataObj: ' + searchResult.getStandardRefDataObj() + '\n'
        objectStr += '      brandedDataObj: ' + searchResult.getBrandedDataObj() + '\n'
      }
    }
    return objectStr
  }

}
