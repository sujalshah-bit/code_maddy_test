"use client"

import { useState } from "react"
import { Menu, Maximize2, Mic, MicOff, Video, VideoOff, MessageCircle, Phone, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Component() {
  const [open, setOpen] = useState(false)
  const [activeCall, setActiveCall] = useState(1)
  const [mic1, setMic1] = useState(true)
  const [camera1, setCamera1] = useState(true)
  const [mic2, setMic2] = useState(true)
  const [camera2, setCamera2] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, user: "Alex", text: "Hey, how's it going?" },
    { id: 2, user: "Sam", text: "Great! Just finished the project." },
  ])

  const VideoCall = ({ id, mic, setMic, camera, setCamera, isActive }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`mb-6 rounded-xl overflow-hidden ${
        isActive ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md">
        <img
          src={`https://source.unsplash.com/random/400x225?portrait&${id}`}
          alt={`Video feed ${id}`}
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
        <div className="absolute bottom-3 left-3 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
          User {id}
        </div>
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button
            onClick={() => setMic(!mic)}
            className={`${mic ? "text-green-400" : "text-red-400"} hover:bg-white/20 rounded-full p-2`}
          >
            {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setCamera(!camera)}
            className={`${camera ? "text-green-400" : "text-red-400"} hover:bg-white/20 rounded-full p-2`}
          >
            {camera ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
          <button
            className="text-blue-400 hover:bg-white/20 rounded-full p-2"
            onClick={() => setActiveCall(id)}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )

  const ChatMessage = ({ user, text }) => (
    <div className="mb-4">
      <div className="font-medium text-sm text-gray-400">{user}</div>
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 mt-1">{text}</div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <button
        className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md text-white border-transparent hover:bg-white/20 rounded-full p-2"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-gray-900/95 backdrop-blur-xl text-white border-l border-white/10 overflow-hidden transform ${open ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex justify-between items-center p-6">
          <h2 className="text-white text-xl font-light">Video Calls</h2>
          <button className="rounded-full hover:bg-white/10 p-2" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />dsf
          </button>
        </div>
        <div className="h-[calc(100vh-7rem)] overflow-y-auto pr-4 pl-6">
          <AnimatePresence>
            <VideoCall
              id={1}
              mic={mic1}
              setMic={setMic1}
              camera={camera1}
              setCamera={setCamera1}
              isActive={activeCall === 1}
            />
            <VideoCall
              id={2}
              mic={mic2}
              setMic={setMic2}
              camera={camera2}
              setCamera={setCamera2}
              isActive={activeCall === 2}
            />
          </AnimatePresence>
          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="text-green-400 hover:bg-white/10 rounded-full px-6 py-2 flex items-center"
            >
              <Phone className="h-4 w-4 mr-2" />
              Join Call
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="text-white hover:bg-white/10 rounded-full px-6 py-2 flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {showChat ? "Hide Chat" : "Show Chat"}
            </button>
          </div>
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4">
                  <div className="mb-4 space-y-4">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} user={msg.user} text={msg.text} />
                    ))}
                  </div>
                  <textarea
                    placeholder="Type a message..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg resize-none p-2"
                  />
                  <button className="mt-3 w-full bg-blue-500 hover:bg-blue-600 rounded-lg py-2">Send</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* <main className="p-8">
        <h1 className="text-4xl font-light mb-4">Main Content</h1>
        <p className="text-gray-400">Click the menu icon in the top right corner to open the updated modern video call sidebar.</p>
      </main> */}
    </div>
  )
}