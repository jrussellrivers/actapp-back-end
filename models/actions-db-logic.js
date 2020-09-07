const db = require('../db_connection')

const Actions = () => {

    const getAllActions = async () => {
        return await db.any('select * from actions')
    }

    const findActionResources = async actionId => {
        return await db.one(`select * from actions where id = ${actionId}`)
    }

    return {
        getAllActions,
        findActionResources
    }
}

module.exports = Actions