const db = require('../db_connection')

const Policy = () => {
    
    const getPolicyByEvent = async event_id => {
        return await db.any(`select * from policies where event_id = '${event_id}'`)
    }

    const getPolicySupportNums = async policy_id => {
        return await db.any(`select count(*) from policies where id = ${policy_id}`)
    }
    //next steps, build the route for /policysupport, fetch it to somewhere, and render the count
    //eventually, show which of the users' friends have supported the policy
    
    return {
        getPolicyByEvent,
        getPolicySupportNums
    }
}

module.exports = Policy