const express = require("express");


// cloudinary and multer

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const User = require("../Models/User");


const router = express.Router();
const Thought = require("../Models/thought");
const mongoose = require("mongoose");
const cloudImageModel  = require("../Models/cloudImageModel");





router.get('/getuserposts/', function (request, response) {

  
  Thought.find({user: request.body.userId})
   .select("_id  user title  about createdAt  thoughtImageUrl    thoughtImageCloudId ")
    .exec()
    .then(function (results) {
      response.status(200).json({ message: "OK", results: results });
    })
    .catch(function (error) {
      response.status(500).json({ error: error.message });
    });


});


router.post('/userpost', upload.single('thoughtImage'),   function (request, response) {

  // Upload image to cloudinary
  
      cloudinary.uploader.upload(request.file.path)
    .then(function(x)
    {
      // Create new userCloud
  
      const cloud = new cloudImageModel({
        name: request.body.name,
        avatar: x.secure_url,
        cloudinary_id: x.public_id,
      });
      // Save userImage to cloud
       cloud.save()
         .then(function(cloudResponse)
  
       {  // if image is saved,  then go check  the rsponse and get its url
     
       // response.status(200).json(cloudResponse);  
        if(cloudResponse)
        
          {
            // console.log({body: request.body.userId})
            const thought = new Thought({
              _id: new mongoose.Types.ObjectId,
              user : request.body.userId,
              title: request.body.title,
              about: request.body.about,
              thoughtImageUrl: cloudResponse.avatar,
              thoughtImageCloudId: cloudResponse.cloudinary_id
            });
          
            thought.save()
              .then(function (results) {
                response.status(200).json({
                  _id: results._id,
                  user : results.userId,
                  title: results.title,
                  about: results.about,
                  thoughtImageUrl: results.thoughtImageUrl,
                  thoughtImageCloudId: results.thoughtImageCloudId,
                  createdAt: results.createdAt
                  
                });
                console.log(results);
            })
              .catch(function (error) {
          
                return response.status(500).json({ error: error.message });
              });
          
          
          }
          else {
            response.status(500).json({error : error.message});
  
          }
  
        })
        .catch(function (error) {
          
          return response.status(500).json({ error: error.message });
        });
    })
    .catch((error) => {
      response.status(500).send({
        message: "failed",
        error,
      }); 
    });   
       
    
    });
  
     
    
 





router.patch('/updatethought',upload.single('thoughtImage'),  function (request, response) {

  const id =  request.body.idNo;
  const image = request.file.path;

  //get the old data and delete it 
  Thought.findById(id)
  .select(" thoughtImageCloudId")
  .exec()
  .then(function(results)
  {  
         // get cloudinary id and delete it
           cloudinary.uploader.destroy(results.thoughtImageCloudId)
             .then(function (x){
                     // delete the image file from cloudImage_in mongo db
                  cloudImageModel.findOneAndDelete({ cloudinary_id :results.thoughtImageCloudId })
                         .then()
                         .catch(function (error)                    
                               {
                                  response.status(404).json({error: error.message});
                                    });   

              // upload the new one  and get the Id
                 cloudinary.uploader.upload(image)
                 .then(function(results)
                  {
                       const newObject  = {
                           title: request.body.title,
                           about: request.body.about,
                           user : request.body.userId,
                           thoughtImageUrl: results.secure_url,
                          thoughtImageCloudId: results.public_id}


                   // update the data i thought data base
                       mongoose.set('returnOriginal', false);
                        Thought.findByIdAndUpdate(id,newObject,{useFindAndModify:false})
                      .select("_id title about thoughtImageUrl thoughtImageCloudId createdAt")
                        .exec()
                         .then(function (results){
                           const responseObject = {thought: results,
                                detail :{
                                    type : "UPDATE",
                                     updated_Id : results._id
                                }
                        }
                   response.status(200).json(responseObject)
                        })
                      .catch(function(error){
                    response.status(500).json({error: error.message})
                                          });
  
                   })
               .catch((error) => {
               response.status(500).send({
                message: "failed",
                   error, })
                        }); 
                
               })

                     
              .catch((error) => {
             response.status(500).send({
              message: "failed",
              error,
                }); 
           }); 
          
       
 }).  catch(function(error){
  response.status(500).json({error: error.message})
                        });   


});


router.delete('/deletethought',  function (request, response) {
  
   const   id = request.body.idNo;
   let temp_cloud_Id ;
 
  Thought.findByIdAndDelete(id)
  .exec()
  .then(function(results){
   const responseObject = {thought: results,
       detail :{
           type : "DELETE",
            deleted_Id : results._id
       }
   }

      cloudinary_id =  results.thoughtImageCloudId ; 
    temp_cloud_Id =  cloudinary_id;
   // destroy the data in mongo and cloud

     // Delete image from cloudinary
     console.log({cloudImageId :  temp_cloud_Id  });

      cloudinary.uploader .destroy(cloudinary_id)
      .then()
      .catch((error) => {
        response.status(500).send({
          message: "failed",
          error,
        }); 
      });   
             


   cloudImageModel.findOneAndDelete({cloudinary_id  : cloudinary_id })
   .exec()
   .then(function(results){

   
    response.status(200).json(results);
   })  
       .catch( function(err){
    console.log(err)
    response.status(500).json({error:err});
       });
   
  response.status(200).json(responseObject)
  })
  .catch(function(error){
      console.log(error)
      response.status(500).json({error:error});

});
    

});







module.exports = router;



