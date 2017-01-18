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

  matchTagsToNutritionData(tags) {
    const splitTags = tags.split(' ')
    const numTags = splitTags.length
    let tagRegExps = []
    // Regexps to look for the exact word (i.e. tag=egg, match on eggs, egg, but not Eggnog)
    let tagExactWordRegExps = []
    let tagStartsWordRegExps = []

    // DO NOT MAKE THE REGEX FLAGS GLOBAL FOR THESE REGEX'S -- THE
    // REGEX WILL CONTINUE MATCHING THE LAST OBJECT IF THERE ARE MORE MATCHES IN IT!!!!!
    // SEE: http://stackoverflow.com/questions/11477415/why-does-javascripts-regex-exec-not-always-return-the-same-value
    let regexFlags = "i"

    // Pre-create regular expressions for the tags being searched for.
    for (let i = 0; i < numTags; i++) {
      this.matches[splitTags[i]] = []

      let tag = splitTags[i]


      // The Raspberry / Blueberry fix. The FDA database contains 'Blueberries'
      // so when you search for 'Blueberry' you won't get the desired result. The
      // following code will search the tag for the word 'berry' and reduce it to
      // 'berr' permitting all results to be found:
      let berryTag = false
      const berryPattern = "(.*)(berry|berries)"
      const berryRe = new RegExp(berryPattern, regexFlags)
      if (berryRe.test(tag)) {
        tag = tag.replace(berryRe, '$1berr')
        berryTag = true
      }

      // The plural fix--match eggs to things like egg etc...
      const pluralPattern = "^([^s]+)s$"
      const pluralRe = new RegExp(pluralPattern, regexFlags)
      if (pluralRe.test(tag)) {
        tag = tag.replace(pluralRe, '$1')
      }

      if (tag.length >= 2) {
        // Remove leading hashtag and make first alpha char uppercase for best
        // compatibility with FDA DB:
        if (tag.charAt(0) == "#") {
          tag = tag.slice(1).charAt(0).toUpperCase() + tag.slice(2)
        } else {
          tag = tag.charAt(0).toUpperCase() + tag.slice(1)
        }
      }

      tag = tag.trim()

      tagRegExps.push(new RegExp(tag, regexFlags))

      // This pattern matches the exact word in splitTags or a plural version of
      // it case insensitively. Explanations for each part of the regex are:
      //  ^:   match the start of a line
      //  (?:$|\\s|,|s|S): match the end of a line, a whitespace character, a
      //                   comma, or an 's'
      //                   (the ? means do not remember the match--prob.
      //                    irrelevant for the test() method)
      //
      // TODO: permute pattern to include 'y' & 'ies' for berry case
      let pattern = berryTag
        ? "^" + tag + "(?:,|s|y|ies|\\s|$)"
        : "^" + tag + "(?:,|s|\\s|$)"
      tagExactWordRegExps.push(new RegExp(pattern, regexFlags))

      let pattern2 = "^" + splitTags[i] + ".*"
      tagStartsWordRegExps.push(new RegExp(pattern2, regexFlags))
    }

    for (let key in NutritionAlg.data) {
      // Aparently Array.forEach is slow so use regular for loop ...
      // (https://coderwall.com/p/kvzbpa/don-t-use-array-foreach-use-for-instead)
      //
      for (let i = 0; i < numTags; i++) {
        // TODO: Consider changing this from key contains tag to key starts with tag.
        //       Problems include tag "Ground Beef" in key "Beef, ground" if we make
        //       that change (it's probably and issue today too with current algorithm).
        if (tagRegExps[i].test(key)) {
        // Eeeek! WTF was I doing here:
        // if (key.search(tagRegExps[i]) !== -1)
          //
          // We build an array for each tag that contains the key and a coefficient
          // of similarity. The coefficient of similarity is based on levenshtein's
          // algorithm but is tweaked to prioritize whole word matches (i.e. to
          // prevent the best match for 'egg' from being 'eggnog' instead of
          // 'eggs, <some adjective>'):
          //
          let similarityCoef = levenshtein(splitTags[i], key)
          if (! tagExactWordRegExps[i].test(key)) {
            similarityCoef += 50

            if (! tagStartsWordRegExps[i].test(key)) {
              similarityCoef += 50
            }
          }

          // DEBUG help:
          // let execResultLen = 0
          // if (reResult != null) {
          //   execResultLen = reResult.length
          // }
          // console.log('******************************************************')
          // console.log('   similarityCoef: ' + similarityCoef)
          // console.log('   tag =         \"' + splitTags[i] + '\"')
          // console.log('   key =           ' + key)
          // console.log('   exec =          ' + reResult)
          // console.log('   exec length =   ' + execResultLen)
          // console.log('   test =          ' + tagExactWordRegExps[i].test(key))

          this.matches[splitTags[i]].push([key, similarityCoef])
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
    for (let tag in this.matches) {
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

  let row = Array(a.length + 1)
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
