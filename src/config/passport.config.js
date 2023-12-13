import passport from "passport"
import local from 'passport-local'
import UserModel from "../DAO/dbmanagers/models/user.model.js"
import { createHash, passwordValidation } from "../utils.js"
import GitHubStrategy from 'passport-github2'


const localStrategy = local.Strategy

const initializePassport = () => {


    passport.use('register', new localStrategy({
       passReqToCallback : true, //acceso al req
       usernameField : 'email'
    }, async (req,username,password,done) => {
         const { first_name, last_name, age,  email } = req.body


         if(!first_name || !last_name || !age || !email || !password ){
            return res.status(404).send('Error creating User. Some fields are required')
        }

         try{
           const user = await UserModel.findOne({email : username})
           if(user){
            console.log('user alredy exists')
            return done(null,false)
           }

           const newUser = {
            first_name,
            last_name,
            age,
            email,
            password: createHash(password)
           }

           const result = await UserModel.create(newUser)
           return done(null,result)
         }catch(e){
           return done('error register '+e)
         }
    }))


    passport.use('login', new localStrategy({
        usernameField: 'email'
    }, async (username,password,done) => {
        try{
            const user = await  UserModel.findOne({email: username}).lean().exec()
            if(!user){
                console.log('user not found')
                return done(null,false)
            }
            if(!passwordValidation(user,password)){
                console.log('invalid password')
                return done(null,false)
            }
            return done(null,user)
        }catch(e){
            return done('error login '+e)
        }
    }))

    passport.use('github', new GitHubStrategy( {
        clientID: 'Iv1.398ae6e8a2ad2ddc',
        clientSecret: 'a00c8801d2512d8b3e33b1e46497844b918c24d2',
        callbackURL: 'http://127.0.0.1:8080/api/session/githubcallback'
    }, async (accessToken,refreshToken,profile,done) => {
        console.log(profile)
        try{
            const user = await UserModel.findOne({ email : profile._json.email})
            if(user){
                console.log('USER ya se encuentra registrado')
                return done(null,user)
            }

            const newUser = await UserModel.create({
                first_name : profile._json.name,
                last_name: '',
                email: profile._json.email,
                age: 1,
                password: ''
            })

            return done(null,newUser)

        }catch(e){
            return done('error to login with github '+e)
        }
    }))


    passport.serializeUser((user,done) => {
      done(null,user._id)
    })

    passport.deserializeUser(async (id,done) => {
        const user = await UserModel.findById(id)
        done(null,user)
    })
}


export default initializePassport