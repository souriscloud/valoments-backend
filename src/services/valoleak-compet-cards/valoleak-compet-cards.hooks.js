

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async hookContext => {
        const existQuery = await hookContext.service.find({ query: { userId: hookContext.data.userId } })
        if (existQuery.total === 1) {
          hookContext.statusCode = 201
          hookContext.result = await hookContext.service.update(existQuery.data[0]._id, hookContext.data)
        }
        
        return hookContext
      }
    ],
    update: [],
    patch: [],
    remove: [
      // async hookContext => {
      //   let response
      //   try {
      //     response = await hookContext.ser
      //   }
      // }
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
