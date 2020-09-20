const db = require('../db_connection')

const Actions = () => {

    const getAllCauses = async () => {
        return await db.any('select * from causes_list')
    }

    const getAllUsersCauses = async () => {
        return await db.any(`select * from causes`)
    }

    const getAllActions = async () => {
        return await db.any('select * from actions')
    }

    const getActionsByCause = async cause => {
        return await db.any(`select * from actions where cause='${cause}'`)
    }

    const getActionById = async id => {
        return await db.one(`select * from actions where id='${id}'`)
    }

    const findActionResources = async actionId => {
        return await db.any(`select * from action_resources where action_id = ${actionId}`)
    }

    const getAllCoordActions = async () => {
        return await db.any(`select * from coordinated_actions`)
    }

    const findCoordActionResources = async actionId => {
        console.log(actionId,'34')
        let resources = await db.any(`select * from coordinated_action_resources where action_id = ${actionId}`)
        console.log(resources,'36')
        return resources
    }

    return {
        getAllCauses,
        getAllUsersCauses,
        getAllActions,
        getActionsByCause,
        getActionById,
        findActionResources,
        getAllCoordActions,
        findCoordActionResources
    }
}

module.exports = Actions