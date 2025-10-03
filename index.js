const express=require('express');
const cookieparser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const app=express();
const model=require('./models/user.js');
const bcrypt=require('bcrypt');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const port=3000;
app.set("view engine","ejs");
const path=require('path');
app.use(cookieparser());
app.use(express.static(path.join(__dirname,'/public')));
app.get('/',(req,res)=>{
    let tokken=req.cookies.token;
    if(tokken){
        jwt.verify(tokken,"secret",(err,result)=>{
            if(err){
                res.clearCookie("token");
                res.render("index");
            }
            else{
                res.redirect('/content');
            }
        });
    }
    else{

         res.render("index");
    }
    
});
app.get('/sign',(req,res)=>{
    res.render("signup");
})
app.post('/sign',async (req,res)=>{
    const name=req.body.username;
    const password=req.body.password;
    const email=req.body.email;
    const exist= await model.findOne({email});
    if(exist){
        res.send("user already exist,please login");
    }else{
         bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            
            let created=await model.create({
                name,
                password:hash,
                email
            })
            
            await created.save();
            
            let token=jwt.sign({"email":email},"secret");
            res.cookie("token",token);
            res.redirect('/content');
    });

});




    


    }
});
   
app.post('/login',async(req,res)=>{
    const password=req.body.password;
    const email=req.body.email;
    const use= await model.findOne({email});
   
    
    if(use){
        const ex= await bcrypt.compare(password,use.password);
        if(ex){
            let token=jwt.sign({"email":email},"secret");
            res.cookie("token",token);
            res.redirect('/content');
        }else{
            res.send("something went wrong");
        }


    }else{
        res.send("user not found");
    }

});
app.get('/content',(req,res)=>{
    let tokken=req.cookies.token;
    jwt.verify(tokken,"secret",(err,result)=>{
        if(err){
            
            res.redirect('/');
        }
        else{
            res.render("content");
        }
    });

    
});
app.get('/logout',(req,res)=>{
    res.clearCookie("token");
    res.redirect('/');
});
app.listen(port);

