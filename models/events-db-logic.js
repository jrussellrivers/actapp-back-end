const db = require('../db_connection')

const Event = () => {

    const getAllEvents = async () => {
        return await db.any('select * from events')
    }

    const getEvent = async (event_id) => {
        let data = await db.one(`select * from events where id = ${event_id}`)
        console.log(data)
        return data
    }

    const createEvent = async (pic,cause,title,description,startTime,endTime,eventDate,location,organizer,action1,action2,action3) => {
        //insert policies into policies table and associate them with the event_id of this event
        //on the posts page: users have a dropdown from which they can select an event they recently 
            //attended and have their post go into the eventPageFeed and the event data of who completed the action
        return await db.any(`insert into events (pic,cause,title,description,startTime,endTime,eventDate,location,organizer,action1,action2,action3) values ('${pic}','${cause}','${title}','${description}','${startTime}','${endTime}','${eventDate}','${location}','${organizer}','${action1}','${action2}','${action3}')`)
    }

    const getEventsByUser = async (user_id) => {
        let usersEvents = await db.any(`select (event_id) from attendees where user_id = '${user_id}'`)
        let usersEventsInfo = []
        for(let i = 0; i < usersEvents.length;i++){
            let [userEvent] = await db.any(`select * from events where id = '${usersEvents[i].event_id}'`)
            usersEventsInfo.push(userEvent)
        }
        return usersEventsInfo
    }

    const getAttendeesByEvent = async event_id => {
        return await db.one(`select count(*) from attendees where event_id = ${event_id}`)
    }

    const checkIfUserAlreadyAttending = async (user_id,event_id)=> {
        let eventsAttending = await db.any(`select (user_id) from attendees where event_id = ${event_id}`)
        let isAlreadyAttending = false
        for(let i = 0; i < eventsAttending.length; i++){
            if(eventsAttending[i].user_id === user_id){
                isAlreadyAttending = true
            }
            console.log(eventsAttending[i],'30')
            console.log(isAlreadyAttending,'31')
        }
        return isAlreadyAttending
    }

    const addAttendee = async (user_id,event_id) => {
        let alreadyAttending = await checkIfUserAlreadyAttending(user_id,event_id)
        console.log(alreadyAttending,'36')
        let add = false
        alreadyAttending ? add=false : add=true
        console.log(add)
        if(add===true){await db.any(`insert into attendees (user_id,event_id) values (${user_id},${event_id})`)}
        return add
    }

    return {
        getAllEvents,
        getEvent,
        createEvent,
        getAttendeesByEvent,
        addAttendee,
        getEventsByUser
    }
}

module.exports = Event