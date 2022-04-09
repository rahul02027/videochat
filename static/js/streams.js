//const AgoraRTC_N4102 = require("../assets/AgoraRTC_N-4.10.2")

const APP_ID = '6c6ae481d38044e597727837c1b84675'

//Fetching the sessionStorage create in lobby
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
const client = AgoraRTC.createClient({mode:'rtc' , codec:'vp8'})
let UID = Number(sessionStorage.getItem('UID'));

let NAME = sessionStorage.getItem('name')

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    
    document.getElementById('room-name').innerText = CHANNEL
    // user publishes their track
    client.on('user-published' , handleUserJoined)
    // user left the room
    client.on('user-left' , handleUserLeft)
    try
    {
        //join the channel
       UID = await client.join(APP_ID , CHANNEL , TOKEN , UID)
    }
    catch(error)// IF something wrong happens
    {
        console.error(error)
        window.open('/', '_self')
    }
    // get audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member =  await createMember()
    
    // creating video player
    let player = `<div class = "video-container" id = "user-container-${UID}">
                  <div class = "username-wrapper"><span class = "user-name"> ${member.name} </span></div>
                  <div class = "video-player" id = "user-${UID}"</div>
                  </div>`
    // appending the player to videostreams
    document.getElementById('video-streams').insertAdjacentHTML('beforeend' , player)
    // go ahead and play that method
    localTracks[1].play(`user-${UID}`)
    // publishing the track to webpage so other people can also see it
    await client.publish([localTracks[0] , localTracks[1]])
}
let handleUserJoined = async (user , mediaType) => {
    // add that user to remoteuser
    remoteUsers[user.uid] = user
    // subscribe to the remote user
    await client.subscribe(user , mediaType)
    // we will get the videosource
    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null){
            player.remove()
        }
        
        let member = await getMember(user)
        // creating video player
        player = `<div class = "video-container" id = "user-container-${user.uid}">
         <div class = "username-wrapper"><span class = "user-name"> ${member.name} </span></div>
         <div class = "video-player" id = "user-${user.uid}"</div>
         </div>`
        // appending the player to videostreams
        document.getElementById('video-streams').insertAdjacentHTML('beforeend' , player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    //playing audiotrack
    if(mediaType === audio){
        user.audioTrack.play()
    }
}


let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; i < localTracks.length ; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteMember()
    window.open('/','_self')
}

let toggoleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255 , 80 , 80 , 1)'
    }
}

let toggoleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255 , 80 , 80 , 1)'
    }
}

let createMember = async () => {
    //sending request to urls.py of base to create member
    let response = await fetch(`/create_member/` , {
    method: 'POST',
    headers:{
        'Content-Type' : 'application/json'     
    },
    body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})//we will send this data to views and get a member created in response
    })
    let member = await response.json()
    return member
}
// getting the details remote users
let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}
// delete is also a post request same as create
let deleteMember = async () => {
    //sending request to urls.py of base to create member
    let response = await fetch(`/delete_member/` , {
    method: 'POST',
    headers:{
        'Content-Type' : 'application/json'     
    },
    body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})//we will send this data to views and get a member created in response
    })
    let member = await response.json()
    
}

joinAndDisplayLocalStream()

window.addEventListener('beforeunload' , deleteMember)

document.getElementById('leave-btn').addEventListener('click' , leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click' , toggoleCamera)
document.getElementById('mic-btn').addEventListener('click' , toggoleMic)
