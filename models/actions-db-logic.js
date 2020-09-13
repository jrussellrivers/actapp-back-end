const db = require('../db_connection')

const Actions = () => {

    const getAllActions = async () => {
        return await db.any('select * from actions')
    }

    const findActionResources = async actionId => {
        return await db.any(`select * from action_resources where action_id = ${actionId}`)
    }

    return {
        getAllActions,
        findActionResources
    }
}

module.exports = Actions