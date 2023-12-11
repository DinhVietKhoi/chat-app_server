import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { Server } from 'socket.io';
import messageRoutes from './routes/messages.js'
import userRoutes  from './routes/user.js'

const app = express();

dotenv.config();
app.use(cors());
// Thiết lập giới hạn kích thước tối đa của yêu cầu
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());

/* ROUTES */
app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoutes)

/* MONGOOSE SETUP*/
const mongoUrl = process.env.MONGO_URL;

//Listen MongoDB to Server
mongoose.connect(mongoUrl, {
}).then(() => {
    console.log(` DB connect successfully.`)
}).catch((errors) => {
    console.log(`${errors}`)
})
//run server
const port = process.env.PORT || 6001
const server =  app.listen(port, ()=> console.log(`Máy chủ đang hoạt động tại cổng: ${port}`))
  
const io = new Server(server, {
    cors: {
        origin: 'chatapp-dinhvietkhoi.vercel.app',  // Thay đổi thành địa chỉ máy khách của bạn
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        optionsSuccessStatus: 204,
    },
})
const connectedUsers = {}
const connectedGroup = {}
io.on('connection', (socket) => {
    // console.log('A user connected');
    socket.on('add-msg', (newMessage) => {
        io.emit('new-msg', newMessage.data.populateMessage);
    });
    socket.on('user-login', (userId) => {
        const arrUser = Object.values(connectedUsers)
        const checkID = arrUser.findIndex(e => e === userId.userId)
        if (checkID === -1) {
            connectedUsers[socket.id] = userId.userId;
            io.emit('updateUsers', Object.values(connectedUsers));
        }
        else {
            io.emit('updateUsers', Object.values(connectedUsers));
        }

        io.emit('update-user-group', Object.values(connectedGroup));
    })
    socket.on('add-user', (userId) => {
        io.emit('new-user', userId);
    });
    socket.on('add-request', (user) => {
        io.emit('new-request', user);
    })
    socket.on('set-profile', (user) => {
        io.emit('new-profile', {_id: user._id,fullname: user.fullname,avatarImage:user.avatarImage});

    })
    socket.on('add-user-group', (userId) => {
        const arrUser = Object.values(connectedGroup)
        const checkID = arrUser.findIndex(e => e === userId)
        if (checkID === -1) {
            connectedGroup[socket.id] = userId;
            io.emit('update-user-group', Object.values(connectedGroup));
        }
        else {
            io.emit('update-user-group', Object.values(connectedGroup));
        }
    })
    socket.on('disconnect-user-group', () => {
        const disconnectedGroup = connectedGroup[socket.id];
        if (disconnectedGroup) {
            delete connectedGroup[socket.id];
            io.emit('update-user-group', Object.values(connectedGroup));
        }
    })
    socket.on('disconnect', () => {
        const disconnectedUser = connectedUsers[socket.id];
        if (disconnectedUser) {
            delete connectedUsers[socket.id]; // Xóa thông tin người dùng khi họ đóng trình duyệt
            io.emit('updateUsers', Object.values(connectedUsers));
        }
        const disconnectedGroup = connectedGroup[socket.id];
        if (disconnectedGroup) {
            delete connectedGroup[socket.id]; // Xóa thông tin người dùng khi họ đóng trình duyệt
            io.emit('update-user-group', Object.values(connectedGroup));
        }
    });
});
