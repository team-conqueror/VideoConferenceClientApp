const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 8082;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	const customId = socket.handshake.query.id;
	console.log(customId)
	socket.join(customId); // join the room using the custom ID
	socket.emit("me", customId);
	socket.on("disconnect", () => {
		socket.broadcast.to(customId).emit("callEnded"); // send to users in the same room
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		console.log(userToCall)
		console.log(from)
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
