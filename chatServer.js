const socketIO = require("socket.io")
let users = [];

module.exports = function (server) {
    const io = socketIO(server);
    io.on("connection", (socket) => {
        let curUser = "";
        socket.on("login", (data) => {
            if (data === "所有人" || users.filter(u => u.usersname === data).length > 0) {
                socket.emit("login", false)
            } else {
                users.push({
                    usersname: data,
                    socket,
                })
                curUser = data;
                socket.emit("login", true)
                socket.broadcast.emit("userin", data)
            }
        })

        socket.on("users", () => {
            const arr = users.map(u => u.usersname)
            socket.emit("users", arr)
        })

        socket.on("msg", (data) => {
            if (data.to) {
                const us = users.filter(u => u.usersname === data.to);
                const u = us[0]
                u.socket.emit("new msg", {
                    from: curUser,
                    content: data.content,
                    to: data.to,
                })
            } else {
                socket.broadcast.emit("new msg", {
                    from: curUser,
                    content: data.content,
                    to: data.to
                })
            }
        })

        socket.on("disconnect", () => {
            socket.broadcast.emit("userout", curUser);
            users = users.filter((u) => u.usersname !== curUser)
        })
    })
}