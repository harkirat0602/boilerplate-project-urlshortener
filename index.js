require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser")
const dns = require("dns")
const mongoose = require("mongoose");
const { url } = require('inspector');
const mySecret = "mongodb+srv://harkiratkirat0602:ABCXYZ123@mongoconnect.5aifrl7.mongodb.net";
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });


const urlSchema = mongoose.Schema({
  original_url: {
    type: String,
    required: true
  }
})

const URLModel = mongoose.model("url",urlSchema)


// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());

// app.use(bodyParser.json())
app.use(express.json({limit:"32kb"}))
app.use(express.urlencoded({extended:true, limit:"32kb"}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post("/api/shorturl",async(req,res)=>{
  try {
    console.log(req.body.url);
    const url = new URL(req.body.url)
    console.log(url.hostname);
  
    dns.lookup(url.hostname,async(err,address,family)=>{
      if (err) return res.json({error: 'invalid url'})
  
      const urlobj = await URLModel.create({original_url:url})
      const urlobjnew = await URLModel.findById(urlobj._id)
  
      if (urlobjnew) {
        return res.json({
          original_url: urlobj.original_url,
          short_url: urlobj._id
        })
      }
      else return res.json({error: "error"})
    })
  } catch (error) {
    return res.json({error: error})
  }

})


app.get("/api/shorturl/:urlshort",async(req,res)=>{
  const url = await URLModel.findById(req.params.urlshort);

  console.log(url);

  if(url) return res.redirect(url.original_url)
  else return res.json({error: 'invalid url'})
})


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
