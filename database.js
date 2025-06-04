const mongoose = require('mongoose')
const url = 'mongodb+srv://admin:123senac@projetoestudo.qp8p0.mongodb.net/dbultraplay'
let conectado = false
const conectar = async () => {
    if (!conectado) {
        try {
            await mongoose.connect(url) 
            conectado = true
            return true 
        } catch (error) {
            if (error.code = 8000) {
            } else {
            }
            return false
        }
    }
}
const desconectar = async () => {
    if (conectado) {
        try {
            await mongoose.disconnect(url) 
            conectado = false
            return true 
        } catch (error) {
            return false
        }
    }
}
module.exports = { conectar, desconectar }