import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { SocketEvent, SocketId } from "./types/socket";
import { User, USER_CONNECTION_STATUS } from "./types/user";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

let userSocketMap: User[] = []

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

function getTotalUsersInRoom(roomId: string): number {
	return userSocketMap.filter((user) => user.roomId == roomId).length
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId
	)?.roomId

	if (!roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return roomId
}

function getUserBySocketId(socketId: SocketId): User | null {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	if (!user) {
		console.error("User not found for socket ID:", socketId)
		return null
	}
	return user
}

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
});

io.on("connection", (socket) => {
	socket.on(SocketEvent.JOIN_REQUEST, (data: { roomId: string, username: string }) => {
		console.log(data);
		// Check is username exist in the room
		const isUsernameExist = getUsersInRoom(data.roomId).filter(
			(u) => u.username === data.username
		)
		const totalUsersInRoom = getTotalUsersInRoom(data.roomId)
		if (totalUsersInRoom >= 2) {
			io.to(socket.id).emit(SocketEvent.ROOM_FULL)
			return
		}

		if (isUsernameExist.length > 0) {
			io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
			return
		}
		const user = {
			username: data.username,
			roomId: data.roomId,
			status: USER_CONNECTION_STATUS.ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(data.roomId)
		socket.broadcast.to(data.roomId	).emit(SocketEvent.USER_JOINED, { user })
		const users = getUsersInRoom(data.roomId)
		io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
	});

	// Handle file actions
	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		({ openFiles, activeFile,text, socketId }) => {
			console.log('Syncing file structure:', openFiles, activeFile);
			io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
				openFiles,
				activeFile,
				text
			})
		}
	)
	socket.on(
		SocketEvent.RESYNC_FILE_STRUCTURE,
		({ openFiles, activeFile,text, roomId, isSharer }) => {
			console.log({roomId})
			console.log('Syncing file structure:', openFiles, activeFile);
			const users = getUsersInRoom(roomId);
			const anotherUser = users.filter((user) => user.socketId !== socket.id);
			console.log(anotherUser)
			io.to(anotherUser[0].socketId).emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
				openFiles,
				activeFile,
				text,
				isSharer
			})
		}
	)
	socket.on(
		SocketEvent.REQUEST_FILE_CONTENT,
		(fileName, roomId) => {
			if(!roomId){
				console.log("room Id is undefined")
				return;
			}
			console.log('Requesting file content:', fileName);
			const users = getUsersInRoom(roomId);
			const anotherUser = users.filter((user) => user.socketId !== socket.id);
			
			const requestingSocketId = socket.id;
			console.log(users)
			
			io.to(anotherUser[0].socketId).emit(SocketEvent.FILE_REQUESTED_FROM_PEER, {
				fileName,
				requestingSocketId
			});
		}
	);

	// Add new handler for file content response
	socket.on(
		SocketEvent.SEND_FILE_CONTENT,
		(response) => {
			const users = getUsersInRoom(response.roomId);
			const anotherUser = users.filter((user) => user.socketId !== socket.id);
			// Send the response back to the requesting user
			io.to(anotherUser[0].socketId).emit(SocketEvent.REQUEST_FILE_CONTENT_RESPONSE, response);
		}
	);

	// Handle user status
	socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.OFFLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId })
	})

	socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: USER_CONNECTION_STATUS.ONLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId })
	})

	socket.on(SocketEvent.TYPING_START, ({ changes, cursorPosition, selection }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: true, cursorPosition }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user })
	})

	socket.on(SocketEvent.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user })
	})

	socket.on(SocketEvent.FILE_UPDATED, ({ file, newContent, roomId }) => {
		console.log('File updated:', file, newContent);
		// Handle the file update logic here
		const users = getUsersInRoom(roomId);
		const anotherUser = users.filter((user) => user.socketId !== socket.id);
		if(anotherUser.length > 0){
			io.to(anotherUser[0].socketId).emit(SocketEvent.FILE_UPDATED, { file, newContent });
		}else{
			console.log("No another user found", roomId, anotherUser)
		}
		
	})



	socket.on("disconnecting", () => {
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.USER_DISCONNECTED, { user })
			console.log('USER GONE \n\n\n')
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)
		socket.leave(roomId)
	})
});

app.get('/', (req: Request, res: Response) => {
	res.send("Server is running!");
});

// New endpoint for room information
app.get("/rooms", (req: Request, res: Response) => {
	// Group users by roomId
	const rooms = userSocketMap.reduce((acc, user) => {
		if (!acc[user.roomId]) {
			acc[user.roomId] = [];
		}
		acc[user.roomId].push({
			username: user.username,
			status: user.status,
			typing: user.typing,
			currentFile: user.currentFile
		});
		return acc;
	}, {} as Record<string, Partial<User>[]>);

	res.json({
		totalRooms: Object.keys(rooms).length,
		rooms: rooms
	});
});

app.get("/health", (req: Request, res: Response) => {
	const now = new Date();
	const formattedDate = now.toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	});
	
	res.json({ 
		status: 'ok', 
		timestamp: formattedDate 
	});
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

