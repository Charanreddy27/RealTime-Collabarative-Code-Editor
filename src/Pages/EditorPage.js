import React,{useState,useRef,useEffect} from 'react'
import Client from '../Component/Client';
import Editor from '../Component/Editor';
import Actions from '../Actions';
import { initSocket } from '../socket';
// import {useLocation} from 'react-router-dom'
import { Navigate, useLocation ,useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
// import {useLocation} from ';
const EditorPage = () => {
   
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();
  const codeRef = useRef(null);
  var flag =0;
  const [clients,setClients] =useState([]);
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', handleErrors);
      socketRef.current.on('connect_failed', handleErrors);
  
      function handleErrors(err) {
        console.log('Socket error', err);
        toast.error('Socket connection failed. Try again later');
        reactNavigator('/');
      }
      console.log("socket",socketRef)
      socketRef.current.emit(Actions.JOIN, {
        roomId,
        username: location.state?.username,
      });
  
      socketRef.current.on(Actions.JOINED, ({ clients, username, socketId }) => {
        console.log("Breakpoint connected");
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room`);
          console.log(`${username} joined the room`);
        }
        console.log(clients);
        setClients(clients);
        socketRef.current.emit(Actions.SYNC_CODE,{
          code:codeRef.current,
          socketId
        })
      });
//Listening for disconnected clients
      socketRef.current.on(Actions.DISCONNECTED,({socketId,username})=>{
        toast.error(`${username} left the room`);
        setClients((prev)=>{
          return prev.filter(client=>client.socketId !== socketId);
        })
      })

    };
    if(flag===0){
      init();
      flag = 1;
    }
    else{
      console.log("second argument")
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(Actions.JOINED);
        socketRef.current.off(Actions.DISCONNECTED); // Make sure to use off() to remove the event listener
      }
    };
  }, []); // Empty dependencies array ensures this runs only on initial mount
  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id has been copied successfully");
    }
    catch(e){
      toast.error("Something went wrong, Please try again later")
      console.error(e);
    }
  }

function leaveRoom(){
  reactNavigator('/');
}
  if(!location.state){
    return <Navigate to={"/"}/>
  }
  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <div className='logo'>
                    <img className='logoImage' src='/logo.png' alt='logo'/>
                </div>
                <h3 className=''>Connected</h3>
                {/* <div className='clientsList'>
                    {clients.map(client =>{
                      // console.log(client.socketId,client.username);
                      <Client key={client.socketId} username={client.username}/>
                    })}
                </div> */}
                <div className='clientsList'>
                  {clients.map(client => (
                    <Client key={client.socketId} username={client.username} />
                  ))}
                </div>
            </div>
            <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
            <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
        </div>
        <div className='editorWrap'>
        {socketRef.current && <Editor onCodeChange={(code)=>{codeRef.current=code;} } socketRef={socketRef} roomId={roomId} />}
        </div>
    </div>
  )
}

export default EditorPage;
// import React, { useState, useRef, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import ACTIONS from '../Actions';
// import Client from '../components/Client';
// import Editor from '../components/Editor';
// import { initSocket } from '../socket';
// import {
//     useLocation,
//     useNavigate,
//     Navigate,
//     useParams,
// } from 'react-router-dom';
// import React,{useState,useRef,useEffect} from 'react'
// import Client from '../Component/Client';
// import Editor from '../Component/Editor';
// import ACTIONS from '../Actions';
// import { initSocket } from '../socket';
// // import {useLocation} from 'react-router-dom'
// import { Navigate, useLocation ,useNavigate, useParams } from 'react-router';
// import toast from 'react-hot-toast';
// const EditorPage = () => {
//     const socketRef = useRef(null);
//     const codeRef = useRef(null);
//     const location = useLocation();
//     const { roomId } = useParams();
//     const reactNavigator = useNavigate();
//     const [clients, setClients] = useState([]);

//     useEffect(() => {
//         const init = async () => {
//             socketRef.current = await initSocket();
//             socketRef.current.on('connect_error', (err) => handleErrors(err));
//             socketRef.current.on('connect_failed', (err) => handleErrors(err));

//             function handleErrors(e) {
//                 console.log('socket error', e);
//                 toast.error('Socket connection failed, try again later.');
//                 reactNavigator('/');
//             }

//             socketRef.current.emit(ACTIONS.JOIN, {
//                 roomId,
//                 username: location.state?.username,
//             });

//             // Listening for joined event
//             socketRef.current.on(
//                 ACTIONS.JOINED,
//                 ({ clients, username, socketId }) => {
//                     if (username !== location.state?.username) {
//                         toast.success(`${username} joined the room.`);
//                         console.log(`${username} joined`);
//                     }
//                     setClients(clients);
//                     socketRef.current.emit(ACTIONS.SYNC_CODE, {
//                         code: codeRef.current,
//                         socketId,
//                     });
//                 }
//             );

//             // Listening for disconnected
//             socketRef.current.on(
//                 ACTIONS.DISCONNECTED,
//                 ({ socketId, username }) => {
//                     toast.success(`${username} left the room.`);
//                     setClients((prev) => {
//                         return prev.filter(
//                             (client) => client.socketId !== socketId
//                         );
//                     });
//                 }
//             );
//         };
//         init();
//         return () => {
//             socketRef.current.disconnect();
//             socketRef.current.off(ACTIONS.JOINED);
//             socketRef.current.off(ACTIONS.DISCONNECTED);
//         };
//     }, []);

//     async function copyRoomId() {
//         try {
//             await navigator.clipboard.writeText(roomId);
//             toast.success('Room ID has been copied to your clipboard');
//         } catch (err) {
//             toast.error('Could not copy the Room ID');
//             console.error(err);
//         }
//     }

//     function leaveRoom() {
//         reactNavigator('/');
//     }

//     if (!location.state) {
//         return <Navigate to="/" />;
//     }

//     return (
//         <div className="mainWrap">
//             <div className="aside">
//                 <div className="asideInner">
//                     <div className="logo">
//                         <img
//                             className="logoImage"
//                             src="/code-sync.png"
//                             alt="logo"
//                         />
//                     </div>
//                     <h3>Connected</h3>
//                     <div className="clientsList">
//                         {clients.map((client) => (
//                             <Client
//                                 key={client.socketId}
//                                 username={client.username}
//                             />
//                         ))}
//                     </div>
//                 </div>
//                 <button className="btn copyBtn" onClick={copyRoomId}>
//                     Copy ROOM ID
//                 </button>
//                 <button className="btn leaveBtn" onClick={leaveRoom}>
//                     Leave
//                 </button>
//             </div>
//             <div className="editorWrap">
//                 {/* <Editor
//                     socketRef={socketRef}
//                     roomId={roomId}
//                     onCodeChange={(code) => {
//                         codeRef.current = code;
//                     }}
//                 /> */}
//                  {socketRef.current && <Editor onCodeChange={(code)=>{codeRef.current=code;} } socketRef={socketRef} roomId={roomId} />}
//             </div>
//         </div>
//     );
// };

// export default EditorPage;