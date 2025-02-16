import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useUserActions } from "../stores/userStore";
import { useSocket } from "../Context/SocketProvider";
import { useAppStore } from "../stores/appStore";
import InfoModal from "./InfoModal";

const LandingPage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { setUser } = useUserActions();
  const { joinRoom } = useSocket();
  const [isInfoSeen, setIsInfoSeen] = useState(false);
  const { notifications } = useAppStore();
  // Load saved username if exists
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);
  const onClose = () => {
    localStorage.setItem("InfoModalShown", true);
    setIsInfoSeen(true)
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (username.length > 20) {
      newErrors.username = "Username must be less than 20 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, underscores, and hyphens";
    }

    // Room ID validation
    if (!roomId) {
      newErrors.roomId = "Room ID is required";
    } else if (roomId.length !== 36) {
      newErrors.roomId = "Invalid Room ID format";
    } else if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        roomId
      )
    ) {
      newErrors.roomId = "Invalid UUID format";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUser.setUsername(username);
    setUser.setCurrentRoomId(roomId);
    setUser.setIsValid(true);
    // setUsers.setList({currentUser: {username, roomId}})

    joinRoom({ roomId, username });
    navigate(`/${roomId}`, { state: { username } });
  };

  const generateNewUUID = () => {
    const newUUID = uuidv4();
    setRoomId(newUUID);
    setFormErrors((prev) => ({ ...prev, roomId: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Join Code Editor
        </h1>

        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Room ID
            </label>
            <div className="relative">
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  if (formErrors.roomId) {
                    setFormErrors((prev) => ({ ...prev, roomId: undefined }));
                  }
                }}
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  formErrors.roomId ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter Room ID"
              />
            </div>
            {formErrors.roomId && (
              <p className="mt-1 text-sm text-red-500">{formErrors.roomId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (formErrors.username) {
                  setFormErrors((prev) => ({ ...prev, username: undefined }));
                }
              }}
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                formErrors.username ? "border-2 border-red-500" : ""
              }`}
              placeholder="Enter your username"
            />
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!roomId || !username}
          >
            Join Room
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-400 text-center">
          Enter a Room ID or generate a new one to create a room
          <button
            type="button"
            onClick={generateNewUUID}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Generate UUID
          </button>
        </p>
      </div>
      {!localStorage.getItem("InfoModalShown") ? (
        <InfoModal onClose={onClose} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default LandingPage;
