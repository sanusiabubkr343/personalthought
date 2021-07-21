
const express = require("express");
var validator = require('validator');
const nodemailer = require('nodemailer');

// cloudinary and multer

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

const User = require("../Models/User");
const router = express.Router();

const mongoose = require("mongoose");
const cloudImageModel  = require("../Models/cloudImageModel");
bcrypt =  require('bcrypt');
const jwt  =  require('jsonwebtoken');

const saltRounds = 10;


router.post('/signup',upload.single('userImage'),function(request, response){
  const email  = request.body.email;


  if(validator.isEmail(email)){
    User.find( {email : request.body.email})
    .exec()
    .then(function (results){
  
        if(results.length >=1){
         
           return  response.status(409).json({message :'Mail  Already  Exist'});
  
        }
        else{
            bcrypt.hash(request.body.password, saltRounds, function(err, hash) {
  
                if(err){
                     response.status(500).json({error : err});
                     console.log(err);
  
                } 
                 else{
                
                       cloudinary.uploader.upload(request.file.path)
                       .then(function (x) {
  
                     // Create new userCloud
    
                          const cloud = new cloudImageModel({
                          name: request.body.name,
                           avatar:x.secure_url,
                            cloudinary_id: x.public_id,
                              });
  
                       cloud.save()
                       .then(function(cloudResponse){
  
                          // Register User
                        const user = new User({
                          _id: new mongoose.Types.ObjectId,
                          username: request.body.username,
                           email: request.body.email,
                           password: hash,
                           secretkey :process.env.EMAIL_SECRET_KEY,
                          userImageUrl: cloudResponse.avatar,
                          userImageCloudId: cloudResponse.cloudinary_id
                        });
  
                        user.save()
                        .then(function(results) {
                          response.status(200).json({
                            _id: results._id,
                            username: results.username,
                           email: results.email,
                          userImageUrl: results.userImageUrl,
                            userImageCloudId: results.userImageCloudId,
                            createdAt: results.createdAt
                            
                          });
                        })
                        .catch(function(error){
                          console.log(error);
                          response.status(500).json({error:error.message});
                         
                          
                          });
  
                       })
  
                       })
                       
                       .catch((error) => {
                        response.status(500).send({
                          message: "failed",
                          error,
                        });
                    });
                  
                 }     
                
            });
        
         
        }
    }).catch(function (error){
        response.status(500).json({error:error.message});
        console.log(error);
          });


          //Todo send a mail to the email of user using node mailer
          let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env. USER_MAIL ,
                pass: process.env. USER_PASSWORD
            }
        });
          
        let mailDetails = {
            from:  process.env. USER_MAIL ,
            to: email,
            subject: 'Email Verification for Thought App',
            text: process.env.  EMAIL_SECRET_KEY
        };
          
        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log({error: err});
            } else {
                console.log(data);
            }
        });


  }
  else{
    return  response.status(409).json({message :'Not a Valid Email'});
  }

   
  });


  router.post('/verify',function(request, response){
          
      const key  = request.body.verificationCode;
      const userEmail  = request.body.email;


            if(key == process.env.EMAIL_SECRET_KEY){
                   // Find the document that describes "lego"
                   User.findOneAndUpdate({'email' :userEmail},{ 'verified' : true},{returnOriginal: false ,useFindAndModify:false})
                   .then(function(results){
                    if(!results){
                      return response.status(400).send({
                        error: "email does not exist"
                      })
                    }
                    const responseObject = {UserDetail: results,
                      detail :{
                          type : "UPDATE",
                           updated_Id : results._id}
                          }
                          response.status(200).json(responseObject)
                        }
                    )
                   .catch(function(error){
                    response.status(404).json({error: error.message})
                                          });

            }
            else{
               return  response.status(500).json({message : "Verification failed"});
            }

  });


  router.post('/login',function(request,response)
{ 
   //Todo check verification for user before loging in
  const username  = request.body.username;
  const password  =  request.body.password;

  User.find({username: username})
  .exec()
  .then(function(data)
  {   
      if(data.length < 1){
        return response.status(401).json({message :  'Auths failed'});
      }
      else {
              if(data[0].verified == true)
              {
                bcrypt.compare(password, data[0].password,function(err,result){
                  if(!result)
                  {
                    return response.status(401).json({message : 'Auth failed'});
                  }
                 if(result)
                 {
                     
                     const token =  jwt.sign({
                         email : data[0].email,
                         userId : data[0]._id
                     }
                     ,process.env.JWT_KEY,
                     
                     
                    {expiresIn : "1h"}
                     )
                    return response.status(200).json({message : 'Auth Successful',token : token});
                 }
               
              });
              }
              else{
                return response.status(404).json({message : ' Auth Failed ,Verify the email '});
              }
       
          
      }

  })
  .catch(function (error){
        response.status(500).json({error:error});

    });


});







router.delete('/:userId',function (request,response)
{
     User.findByIdAndDelete( request.params.userId).
     exec()
     .then(function(results)
     {
      const responseObject = {User: results,
        detail :{
            type : "DELETE",
             deleted_Id : results._id
        }
        
    }

    response.status(200).json(responseObject);
     })
     .catch(function(error)
     {
         response.status(500).json({error:error});
         console.log(error);
     });

})


module.exports = router;



