import { Router } from 'express'
import UserModel from "../DAO/dbmanagers/models/user.model.js"
import { createHash, passwordValidation } from '../utils.js'
import passport from 'passport'
import initializePassport from '../config/passport.config.js'

const router = Router()

router.get('/error', (req,res) => {
    res.send('ERROR')
})


router.post('/login', passport.authenticate('login', {failureRedirect: '/login'} ), async(req,res) => {

    if(!req.user) return res.status(404).send('Invalid credentials')

    console.log('logged in!')

    req.session.user = req.user
    return res.redirect('/')

})

router.get('/github', passport.authenticate('github', {scope : ['user:email']}), async (req,res) => {


})

router.get('/githubcallback', passport.authenticate('github', {failureRedirect : '/error'} ), async (req,res) => {

    console.log('callback: '+req.user)

    req.session.user = req.user

    console.log('user session for github setted')

    return res.redirect('/')

})


router.post('/register', passport.authenticate('register', {failureRedirect: '/register'} ),  async (req, res) => {
    console.log('registered!')
    return res.redirect('/')
})


router.get('/logout', (req,res) => {
    req.session.destroy(err => {
        if(err) res.status(404).send('logout error')

        return res.redirect('/login')
    })
})

export default router
