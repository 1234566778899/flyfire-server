const socketIO = require('socket.io');
const users = new Map();
const rooms = new Map();
const setupSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://flyfar-liard.vercel.app'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('enter', data => {
            socket.code = data._id;
            users.set(data._id, socket.id);
            const actives = data.friends.map(x => ({ ...x, online: users.get(x._id) ? true : false }));
            socket.emit('online_friends', actives);
            socket.broadcast.emit('entering', data._id);
        })
        socket.on('join-sala', data => {
            socket.sala = data;
            socket.join(data);
        })
        socket.on('request_friend', data => {
            socket.broadcast.emit('send_request', data);
        })
        socket.on('status_request', data => {
            socket.broadcast.emit('status_request', data);
        })
        socket.on('create_room', data => {
            socket.sala = data.code;
            socket.join(data.code);
            rooms.set(data.code, { users: [data.user] });
            io.to(socket.sala).emit('update_users', [data.user]);
        })
        socket.on('ended', () => {
            const room = rooms.get(socket.sala);
            if (room) {
                room.users = room.users.map(x => (x.id == socket.code ? { ...x, finished: false } : x));
            }
        })
        socket.on('finished', data => {
            const room = rooms.get(socket.sala);
            if (room) {
                const user = room.users.find(x => x.id == socket.code);
                if (user) {
                    user.finished = data;
                    if (room.users.every(x => x.finished)) {
                        io.to(socket.sala).emit('finished');
                    };
                }
            }
        })
        socket.on('invit_friend', data => {
            const room = rooms.get(socket.sala);
            if (room) {
                if (room.users.find(x => x.id == data.id)) {
                    socket.emit('in_room', 'message');
                } else {
                    io.to(users.get(data.id)).emit('invite_room', data.code);
                }
            }
        })
        socket.on('accept_invitation', data => {
            socket.sala = data.code;
            socket.code = data.user.id;
            socket.join(data.code);
            const room = rooms.get(data.code);
            room.users.push(data.user);
            socket.emit('send_settings', room.settings);
            io.to(data.code).emit('update_users', room.users);
        })
        socket.on('out_room', () => {
            if (rooms.get(socket.sala)) {
                const room = rooms.get(socket.sala);
                if (room.users.length > 1) {
                    room.users = room.users.filter(x => x.id != socket.code);
                    io.to(socket.sala).emit('update_users', room.users);
                } else {
                    rooms.delete(socket.sala);
                }
            }
        })
        socket.on('send_message', data => {
            io.to(socket.sala).emit('recive_message', data);
        })
        socket.on('create-challenge', data => {
            io.to(socket.sala).emit('start-challenge', data);
        })
        socket.on('disconnect', () => {
            users.delete(socket.code);
            io.emit('out_friend', socket.code);
            if (rooms.get(socket.sala)) {
                const room = rooms.get(socket.sala);
                if (room.users.length > 1) {
                    room.users = room.users.filter(x => x.id != socket.code);
                    io.to(socket.sala).emit('update_users', room.users);
                } else {
                    rooms.delete(socket.sala);
                }
            }
        });
        socket.on('send_settings', data => {
            const room = rooms.get(socket.sala);
            room['settings'] = data;
            io.to(socket.sala).emit('send_settings', data);
        })
        socket.on('send_result', () => {
            io.to(socket.sala).emit('send_result');
        })
    });
    return io;
};

module.exports = setupSocket;
