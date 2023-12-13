import { Router } from 'express'
import ProductManager from '../DAO/dbmanagers/productManager.js'
import CartManager from '../DAO/dbmanagers/cartManager.js'

const router = Router()


//Middlewares ------------------------
function sessionActive(req, res, next){
    if(req.session?.user) return res.redirect('/')
    return next()
}

function auth(req, res, next){
    if(req.session?.user) return next()

    res.redirect('/login')
}


//Renders ---------------------------
router.get('/login', sessionActive,  (req,res) => {
    return res.render('login', {} )
})

router.get('/register', sessionActive,  (req,res) => {
    return res.render('register', {} )
})

/*
router.get('/github', sessionActive,  (req,res) => {
    return res.render('github', {} )
})
*/


//solo listado de productos
router.get('/', auth, async (req, res) => {

    const user = req.session.user

    const PM = new ProductManager()
    const products = await PM.getProducts()

    return res.render('index', {
        products,
        user,
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS ESTATICO'
    })
})


//listado de productos con websockets + alta y baja de producto
router.get('/realtimeproducts', auth, async (req,res) => {

    res.render('realTimeProducts', {
        style: 'index.css',
        title : 'LISTADO DE PRODUCTOS WEBSOCKET'
    })

})

// mock para añadir producto al carrito, via websockets
router.get('/cart', auth , async (req, res) => {

    const PM = new ProductManager()
    const CM = new CartManager()

    let cart_id = await CM.createCart()
    const products = await PM.getProducts()

    res.render('cart', {
        products,
        cart_id,
        style: 'index.css',
        title : 'CARRITO DE COMPRAS'
    })
})


router.get('/chat', auth , (req,res) => {
    res.render('chat',{
    style: 'index.css',
    title : 'CHAT'
    })
})



export default router