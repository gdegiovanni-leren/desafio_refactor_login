
import express from 'express'
import handlebars from 'express-handlebars'
import viewsRouter from './routes/views.router.js'
import sessionRouter from './routes/session.router.js'
import __dirname from './utils.js'
import { Server } from 'socket.io'
import ProductController from './DAO/filemanagers/productController.js'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import ProductManager from './DAO/dbmanagers/productManager.js'
import CartManager from './DAO/dbmanagers/cartManager.js'
import ChatManager from './DAO/dbmanagers/chatManager.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'



const app = express()

const PORT = '8080'
const mongoURL = 'mongodb://localhost:27017/'
const mongoDBName = 'desafio_clase21'

app.use(session({
    store: MongoStore.create({
        mongoUrl : mongoURL,
        dbName : mongoDBName,

    }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())


app.use('/static', express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//handlebars config
app.engine('handlebars',handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')


app.use('/',viewsRouter)
app.use('/api/session',sessionRouter)



let httpServer = null


 await mongoose.connect(mongoURL, {dbName: mongoDBName} ).then( () => {
   console.log('DB CONNECTION SUCCESSFUL')
    httpServer =  app.listen(PORT, () => console.log('Listening on port: '+PORT) )
}).catch((e) => {
    console.log(e)
})


const socketServer = new Server(httpServer)

socketServer.on('connection', async socket => {

    console.log('Cliente conectado')

    const PM = new ProductManager()
    const CM = new CartManager()
    const CHATM = new ChatManager()

    const products = await PM.getProducts()

    socket.emit('products',products)


    /* CREATE PRODUCT */
    socket.on('new-product', async product => {

        console.log('NEW PRODUCT SOCKET CALL',product)

        const result = await PM.addProduct(product)

        socket.emit('new-product-message', result)

        const refreshproducts = await PM.getProducts()

         socket.emit('products',refreshproducts)
    })

    /* DELETE PRODUCT */
    socket.on('delete-product', async id => {

        console.log('DELETE PRODUCT SOCKET CALL WITH ID',id)

        const result = await PM.deleteProduct(id)

        socket.emit('delete-product-message', result)

        const refreshproducts = await PM.getProducts()

        socket.emit('products',refreshproducts)

    })

    /* ADD PRODUCT TO CART */
    socket.on('add-product', async add_data => {

        console.log('ADD PRODUCT SOCKET CALL',add_data)

        const result = await CM.addProductToCart(add_data)

        console.log(result)

        socket.emit('add-product-message', result)

    })

    /* CHAT */
    socket.on('new-user-chat', async user => {
        console.log('user connected: ',user)

       const messages = await CHATM.getMessages()

        socket.emit('logs', messages )
    })

    socket.on('message', async data => {

       await CHATM.addMessage(data)

       const messages = await CHATM.getMessages()

       socketServer.emit('logs', messages )
    })



})
