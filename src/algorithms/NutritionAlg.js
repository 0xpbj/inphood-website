// Given a string of food tags 'a, b, c, ...', this class does the following:
//
//  1. Splits the tags and searches a database of nutrition info for matches,
//     collecting each match in a new data structure as follows:
//
//        'a':
//            'a, raw',
//            'boiled a',
//            'a, ground and fried',
//            ...
//        'b':
//            'peeled b',
//            'a and b',
//            ...
//        'c':
//            ...
//
//  2. The matches are then traversed by an algorithm that ranks them by their
//     edit distance from the tag--the higher the number, the higher the edit
//     distance and the less likely the item is the desired choice (the edit
//     distance is not a pure edit distance but will be based on heuristics
//     pertaining to food--numbers shown below are for example and are not
//     actual algorithm output):
//
//        'a':
//            'a, raw', 3,
//            'boiled a', 6,
//            'a, ground and fried', 13,
//            ...
//        'b':
//            'peeled b', 6,
//            'a and b', 4,
//            ...
//        'c':
//            ...
//
//  3. The matches can then be presented to the user with the highest probability
//     one presented by default with the remainder selectable in order of probability.
//
//
//  Unimplemented ideas:
//
//    A 2-level or 3-level search, e.g.
//
//      * Search an abridged list, if it is not in there then search a more
//        complete list of nutrition data
//      * Search an abridged list, if it is not there, then simultaneously
//        search a more complete list of nutrition data while querying a cloud
//        based database that is more complete
//
export default class NutritionAlg {
  constructor() {
    this.debug = true
    this.matches = {}
  }

  processTags(tags) {
    if (this.debug) {
      console.log('Processing Tags')
      console.log('-----------------------------------------------------')
      console.log(tags)
    }

    this.matchTagsToNutritionData(tags)
    this.rankTagMatches()
  }

  // Given an array of tags: #my, #mine, #more
  // Return: My, Mine, More
  //
  getCleanedTags(tags) {
    var newTags = []

    for (var i = 0, numTags = tags.length; i < numTags; i++) {
      const tag = tags[i]

      // Remove leading hashtag and make first alpha char uppercase for best
      // compatibility with FDA DB:
      if (tag.charAt(0) == "#") {
        var cleanedTag = tag.slice(1).charAt(0).toUpperCase() + tag.slice(2)
      } else {
        var cleanedTag = tag.charAt(0).toUpperCase() + tag.slice(1)
      }

      newTags.push(cleanedTag.trim())
    }

    return newTags
  }

  matchTagsToNutritionData(tags) {
    const splitTags = this.getCleanedTags(tags.split(" "))
    const numTags = splitTags.length
    var i = 0
    var tagRegExps = []

    // Pre-create regular expressions for the tags being searched for.
    for (i = 0; i < numTags; i++) {
      this.matches[splitTags[i]] = []
      tagRegExps.push(new RegExp(splitTags[i], "i"))
    }

    for (var key in NutritionAlg.data) {
      // Aparently Array.forEach is slow so use regular for loop ...
      // (https://coderwall.com/p/kvzbpa/don-t-use-array-foreach-use-for-instead)
      //
      for (i = 0; i < numTags; i++) {
        // TODO: Consider changing this from key contains tag to key starts with tag.
        //       Problems include tag "Ground Beef" in key "Beef, ground" if we make
        //       that change (it's probably and issue today too with current algorithm).
        if (key.search(tagRegExps[i]) !== -1) {
          //
          // We build an array for each tag that contains the key and a coefficient
          // of similarity. The coefficient of similarity is based on levenshtein's
          // algorithm but is tweaked to prioritize whole word matches (i.e. to
          // prevent the best match for 'egg' from being 'eggnog' instead of
          // 'eggs, <some adjective>'):
          //
          let similarityCoef = levenshtein(splitTags[i], key)

          this.matches[splitTags[i]].push([key, levenshtein(splitTags[i], key)])
        }
      }
    }

    if (this.debug) {
      console.log('Dump data structure')
      console.log('---------------------------------------------------')
      console.log(this.matches)
    }
  }

  rankTagMatches() {
    for (var tag in this.matches) {
      this.matches[tag].sort(function(a, b) { return a[1] - b[1]})
    }

    if (this.debug) {
      console.log('Dump ranked data structure')
      console.log('---------------------------------------------------')
      console.log(this.matches)
    }
  }

  // Returns the matches which are a dictionary formated as follows:
  //
  //    egg:
  //      'eggs, whipped', 77
  //      'eggs, burnt', 89
  //    ...:
  //
  getMatches() {
    return this.matches
  }

  // Returns the matched key with the best ranking
  //
  getBestMatchForTag(tag) {
    if (this.matches[tag].length != 0) {
      return this.matches[tag][0][0]
    } else {
      return ""
    }
  }

  // Returns a simple list of the matches (instead of pairs of matches , ranking)
  //
  getMatchList(tag) {
    let matchList = []
    for (let i = 0; i < this.matches[tag].length; i++) {
      matchList.push(this.matches[tag][i][0])
    }
    return matchList
  }

  getDataForKey(key) {
    return NutritionAlg.data[key]
  }
}

// Static variable shared by all instances.
// Do not move this line above the class declaration for NutritionAlg (it requires
// NutritionAlg to be defined).
//
NutritionAlg.data = require('../data/complete-001.opt.json')

// Levenshtein algorithm for computing edit distance
//
//   MIT License from optimized comments of https://gist.github.com/andrei-m/982927
//
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  let tmp, i, j, prev, val
  // swap to save some memory O(min(a,b)) instead of O(a)
  if (a.length > b.length) {
    tmp = a
    a = b
    b = tmp
  }

  var row = Array(a.length + 1)
  // init the row
  for (i = 0; i <= a.length; i++) {
    row[i] = i
  }

  // fill in the rest
  for (i = 1; i <= b.length; i++) {
    prev = i
    for (j = 1; j <= a.length; j++) {
      if (b[i-1] === a[j-1]) {
        val = row[j-1] // match
      } else {
        val = Math.min(row[j-1] + 1, // substitution
              Math.min(prev + 1,     // insertion
                       row[j] + 1))  // deletion
      }
      row[j - 1] = prev
      prev = val
    }
    row[a.length] = prev
  }
  return row[a.length]
}
