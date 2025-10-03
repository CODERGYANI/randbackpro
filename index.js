const express=require('express');
const cookieparser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const app=express();
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
app.post('/sign',(req,res)=>{
    const name=req.body.username;
    const pass=req.body.password;
    const email=req.body.email;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(pass,salt,(err,hash)=>{
            let token=jwt.sign({"email":email},"secret");
            res.cookie("token",token);
            res.redirect('/content');
    });

});


    
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
app.listen(port);

