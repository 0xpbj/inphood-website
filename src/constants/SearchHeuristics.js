// TODO: we should reduce this to the ndbNo number and pull from firebase
//       (single source in case we change our db and inPhood001)--this is a
//       quick fix for iteration 6.
//
//       Alternately we could populate this in a build step.
//
export const SearchHeuristics = {
  'yellow onions' : {'alias' : 'yellow onion'},
  'yellow onion' : [
      {
        'ndbNo' : '11286',
        'Description' : 'Onions, yellow, sauteed',
        'inPhood001' : 'Onions, yellow, sauteed'
      },
      {
        'ndbNo' : '11282',
        'Description' : 'Onions, raw',
        'inPhood001' : 'Onions, raw'
      },
      {
        'ndbNo' : '11294',
        'Description' : 'Onions, sweet, raw',
        'inPhood001' : 'Onions, sweet, raw'
      },
      {
        'ndbNo' : '11291',
        'Description' : 'Onions, spring or scallions (includes tops and bulb), raw',
        'inPhood001' : 'Onions, spring or scallions (includes tops and bulb), raw'
      }
    ],
  'green onions' : {'alias' : 'green onion'},
  'green onion' : [
      {
        'ndbNo' : '11292',
        'Description' : 'Onions, young green, tops only',
        'inPhood001' : 'Onions, young green, tops only'
      },
      {
        'ndbNo' : '11282',
        'Description' : 'Onions, raw',
        'inPhood001' : 'Onions, raw'
      },
      {
        'ndbNo' : '11294',
        'Description' : 'Onions, sweet, raw',
        'inPhood001' : 'Onions, sweet, raw'
      },
      {
        'ndbNo' : '11291',
        'Description' : 'Onions, spring or scallions (includes tops and bulb), raw',
        'inPhood001' : 'Onions, spring or scallions (includes tops and bulb), raw'
      }
    ],
  'black pepper' : {'alias' : 'pepper'},
  'pepper, black' : {'alias' : 'pepper'},
  'pepper' : [
      {
        'ndbNo' : '02030',
        'Description' : 'Spices, pepper, black',
        'inPhood001' : 'pepper, black'
      },
      {
        'ndbNo' : '02032',
        'Description' : 'Spices, pepper, white',
        'inPhood001' : 'pepper, white'
      },
    ],
  'bell pepper' : [
      {
        'ndbNo' : '11333',
        'Description' : 'Peppers, sweet, green, raw',
        'inPhood001' : 'sweet, green, raw'
      },
      {
        'ndbNo' : '11821',
        'Description' : 'Peppers, sweet, red, raw',
        'inPhood001' : 'sweet, red, raw'
      },
      {
        'ndbNo' : '11951',
        'Description' : 'Peppers, sweet, yellow, raw',
        'inPhood001' : 'sweet, yellow, raw'
      },
    ],
  'bacon' : [
      {
        'ndbNo' : '10123',
        'Description' : 'Pork, cured, bacon, unprepared',
        'inPhood001' : 'Pork, cured, bacon, unprepared'
      },
    ],
  'chicken' : [
      {
        'ndbNo' : '05057',
        'Description' : 'Chicken, broilers or fryers, breast, meat and skin, raw',
        'inPhood001' : 'Chicken, broilers or fryers, breast, meat and skin, raw'
      }
    ],
  'greek yogurt' : [
      {
        'ndbNo' : '01287',
        'Description' : 'Yogurt, Greek, plain, lowfat',
        'inPhood001' : 'Yogurt, Greek, plain, lowfat'
      }
    ],
  'red onions' : {'alias' : 'red onion'},
  'red onions' : [
      {
        'ndbNo' : '11282',
        'Description' : 'Onions, raw',
        'inPhood001' : 'Onions, raw'
      },
      {
        'ndbNo' : '11294',
        'Description' : 'Onions, sweet, raw',
        'inPhood001' : 'Onions, sweet, raw'
      }
    ],
  'mint' : [
      {
        'ndbNo' : '02065',
        'Description' : 'Spearmint, fresh',
        'inPhood001' : 'Spearmint, fresh'
      },
      {
        'ndbNo' : '02064',
        'Description' : 'Peppermint, fresh',
        'inPhood001' : 'Peppermint, fresh'
      },
      {
        'ndbNo' : '02066',
        'Description' : 'Spearmint, dried',
        'inPhood001' : 'Spearmint, dried'
      }
    ],
  'almond milk' : [
      {
        'ndbNo' : '14091',
        'Description' : 'Beverages, almond milk, unsweetened, shelf stable',
        'inPhood001' : 'almond milk, unsweetened, shelf stable'
      },
      {
        'ndbNo' : '14016',
        'Description' : 'Beverages, almond milk, sweetened, vanilla flavor, ready-to-drink',
        'inPhood001' : 'almond milk, sweetened, vanilla flavor, ready-to-drink'
      }
    ],
  'green cabbage' : [
      {
        'ndbNo' : '11109',
        'Description' : 'Cabbage, raw',
        'inPhood001' : 'Cabbage, raw'
      }
    ],
  'table salt' : {'alias' : 'salt'},
  'salt' : [
      {
        'ndbNo' : '02047',
        'Description' : 'Salt, table',
        'inPhood001' : 'Salt, table'
      }
    ],
  'sugar' : [
      {
        'ndbNo' : '19335',
        'Description' : 'Sugars, granulated',
        'inPhood001' : 'Sugars, granulated'
      },
      {
        'ndbNo' : '19334',
        'Description' : 'Sugars, brown',
        'inPhood001' : 'Sugars, brown'
      },
      {
        'ndbNo' : '19336',
        'Description' : 'Sugars, powdered',
        'inPhood001' : 'Sugars, powdered'
      }
    ],
  'jasmine rice' : [
      {
        'ndbNo' : '20450',
        'Description' : 'Rice, white, medium-grain, raw, unenriched',
        'inPhood001' : 'Rice, white, medium-grain, raw, unenriched'
      },
      {
        'ndbNo' : '20050',
        'Description' : 'Rice, white, medium-grain, raw, enriched',
        'inPhood001' : 'Rice, white, medium-grain, raw, enriched'
      }
    ],
  'thai green chiles' : [
      {
        'ndbNo' : '11670',
        'Description' : 'Peppers, hot chili, green, raw',
        'inPhood001' : 'hot chili, green, raw'
      }
    ],
  'ginger, peeled, cut' : [
      {
        'ndbNo' : '11216',
        'Description' : 'Ginger root, raw',
        'inPhood001' : 'Ginger root, raw'
      }
    ],
  'shallots, thinly sliced' : {'alias' : 'shallot, thinly sliced'},
  'shallots, sliced' : {'alias' : 'shallot, thinly sliced'},
  'shallot, sliced' : {'alias' : 'shallot, thinly sliced'},
  'shallot, thinly sliced' : [
      {
        'ndbNo' : '11677',
        'Description' : 'Shallots, raw',
        'inPhood001' : 'Shallots, raw'
      }
    ],
  'light brown sugar' : [
      {
        'ndbNo' : '19334',
        'Description' : 'Sugars, brown',
        'inPhood001' : 'Sugars, brown'
      }
    ],
  'turnips, trimmed, thinly sliced' : {'alias' : 'turnip, trimmed, thinly sliced'},
  'turnip, trimmed, thinly sliced' : [
      {
        'ndbNo' : '11564',
        'Description' : 'Turnips, raw',
        'inPhood001' : 'Turnips, raw'
      }
    ],
  'radishes, trimmed, thinly sliced' : {'alias' : 'radish, trimmed, thinly sliced'},
  'radish, trimmed, thinly sliced' : [
      {
        'ndbNo' : '11429',
        'Description' : 'Radishes, raw',
        'inPhood001' : 'Radishes, raw'
      }
    ],
  'water' : [
      {
        'ndbNo' : '14411',
        'Description' : 'Beverages, water, tap, drinking',
        'inPhood001' :  'water, tap, drinking'
      },
      {
        'ndbNo' : '14429',
        'Description' : 'Beverages, water, tap, municipal',
        'inPhood001' : 'water, tap, municipal'
      },
      {
        'ndbNo' : '14412',
        'Description' : 'Beverages, water, tap, well',
        'inPhood001' : 'water, tap, well'
      }
    ],
  'toasted peanuts' : [
      {
        'ndbNo' : '16390',
        'Description' : 'Peanuts, all types, dry-roasted, without salt',
        'inPhood001' : 'Peanuts, all types, dry-roasted, without salt'
      },
      {
        'ndbNo' : '16090',
        'Description' : 'Peanuts, all types, dry-roasted, with salt',
        'inPhood001' : 'Peanuts, all types, dry-roasted, with salt'
      }
    ]
}
