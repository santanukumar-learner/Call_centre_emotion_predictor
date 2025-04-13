const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const Usersf = require("./models/user");
require("dotenv").config();
const flash = require("connect-flash");
const session = require("express-session");
const { generateToken, verifyToken } = require("./middleware/isloggedin.js");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const multer = require("multer");
const Customer = require('./models/Customer');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require("fs");
const FormData = require("form-data");
const { GoogleGenerativeAI } = require("@google/generative-ai");




const app = express();
app.use(cors());
app.use(cookieParser());

// ✅ Setup session middleware before flash()
app.use(
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: true
    })
);
app.use(flash());

// ✅ Pass flash messages to every route
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// ✅ Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/Usersf", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("MongoDB Connection Error:", err));

// ✅ Set up middleware

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.static("uploads"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Needed for JSON body parsing

// ✅ Render Homepage (Verify Token)
app.get("/help",verifyToken,  (req, res) => {
    const user = req.user;
    if(user){
        res.render("post_help", { user: req.user });
    }
    else{
        res.render("help");
    }
});
app.get("/user/upload",verifyToken, (req, res) => {
    const user = req.user;
    if(user){
        res.render("post_upload", { user: req.user });
    }
    else{
        res.render("login")
    }
});
app.get("/login", (req, res) => res.render("login"));

//freqlently asked questions
// app.get("/faqs", (req, res) => res.render("faqs"));

app.get("/faqs",verifyToken,  (req, res) => {
    const user = req.user;
    if(user){
        res.render("post_faqs", { user: req.user });
    }
    else{
        res.render("faqs");
    }
});



//free trials

app.get("/try",verifyToken,  (req, res) => {
    const user = req.user;
    if(user){
        res.render("post_try", { user: req.user });
    }
    else{
        res.render("login");
    }
});


app.get("/about",verifyToken, (req, res) => {
    const user = req.user;
    if(user){
        res.render("post_about", { user: req.user });
    }
    else{
        res.render("about")
    }
});
//app.get("/logout", (req,res) => res.redirect("/login"));

app.get("/", verifyToken,(req, res) => {
    const user = req.user;
    if(user){
        res.render("post_index",{user:req.user});
    }
    else{
        res.render("index");
    }
});
app.get("/logout", (req, res) => {
    res.clearCookie("token"); // ✅ Remove JWT Cookie
    req.session.destroy((err) => { // ✅ Destroy session (if any)
        if (err) {
            console.error("Session destruction error:", err);
            return res.redirect("/");
        }
        res.redirect("/login"); // ✅ Redirect to login page after logout
    });
});

// ✅ Register Route (Create & Send JWT Token)
app.post("/register", async (req, res) => {
    try {
        const { username, email, password, age, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Usersf({ username, email, password: hashedPassword, age, gender });
        await newUser.save();

        const token = generateToken(newUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ Secure in production
            maxAge: 2 * 60 * 60 * 1000, // ✅ 2 hours expiry
        });

        req.flash("welcome", "Welcome to the site!");
        //res.json({ message: "User registered successfully", token }); // ✅ Send JWT to frontend
        res.render("post_index",{user:newUser});

    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// ✅ Login Route (Authenticate & Send JWT Token)
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Usersf.findOne({ email });

        if (!user) {
            req.flash("error", "User not found");
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error", "Invalid credentials");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT Token
        const token = generateToken(user);

        // ✅ Set the token as a cookie (HTTP-only for security)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ Secure in production
            maxAge: 2 * 60 * 60 * 1000, // ✅ 2 hours expiry
        });

        req.flash("welcome", `Welcome back, ${user.username}!`);
        res.redirect("/"); // ✅ Redirect without `{ token }`
    } catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
});




// app.post('/upload', upload.single('audio'), async (req, res) => {
//     try {
//         const { customerId, name, email, phone } = req.body;4
//         const audioPath = req.file.path;

//         console.log(name);
//         console.log(audioPath);
        

//         const newCustomer = new Customer({
//             customerId,
//             name,
//             email,
//             phone
//         });

//         await newCustomer.save();
//         res.status(200).json({ message: 'Customer data saved successfully!' });
//     } catch (error) {
//         console.error('Error saving customer:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


app.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        const { customerId, name, email, phone } = req.body;
        const audioPath = req.file.path;

        console.log("👤 Name:", name);
        console.log("🎧 Audio File:", audioPath);

        const newCustomer = new Customer({
            customerId,
            name,
            email, 
            phone
        });

        await newCustomer.save();

        // Call the Python script
         const pythonProcess = spawn('python', ['transcribe.py', audioPath]);
        //const pythonProcess = spawn('python', ['diarize.py', audioPath]);


        pythonProcess.stdout.on('data', (data) => {
            console.log("📄 Transcription Output:\n", data.toString());
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error("❌ Error in Python:", data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log(`🔚 Python script finished with code ${code}`);
        });

        res.status(200).json({ message: 'Customer data saved and audio sent for transcription!' });
    } catch (error) {
        console.error('Error saving customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





//sample upload
// app.post('/uploadsample', upload.single('audio'), async (req, res) => {
//     try {
//       const audioPath = req.file.path;
//       console.log("🎧 Audio File:", audioPath);
  
//       // Step 1: Run the Python script to get transcription
//       const pythonProcess = spawn('python', ['transcribe.py', audioPath]);
  
//       let transcription = "";
  
//       pythonProcess.stdout.on('data', (data) => {
//         transcription += data.toString();
//       });
  
//       pythonProcess.stderr.on('data', (data) => {
//         console.error("❌ Error in Python:", data.toString());
//       });
  
//       pythonProcess.on('close', async (code) => {
//         console.log(`🔚 Python script finished with code ${code}`);
//         console.log("📄 Transcription:", transcription.trim());
  
//         if (!transcription) {
//           return res.status(500).json({ message: 'Transcription failed' });
//         }
  
//         // Step 2: Send transcription to Text Processing API
//         const sentimentResponse = await fetch('https://text-processing.com/api/sentiment/', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//           },
//           body: `text=${encodeURIComponent(transcription)}`
//         });
  
//         const sentimentData = await sentimentResponse.json();
//         console.log("🧠 Sentiment Analysis:", sentimentData);


//         res.render('results', {
//             sentiment: sentimentData
//           });
  
//         // res.status(200).json({
//         //   transcription: transcription.trim(),
//         //   sentiment: sentimentData
//         // });
//       });
  
//     } catch (error) {
//       console.error('💥 Error:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });




const genAI = new GoogleGenerativeAI("AIzaSyBp1vNk_90BkcgRghGEuM1ARSvJ9qpg1Wo");

async function getImprovementSuggestions(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are a professional communication coach. Below is a transcribed dialogue between an AGENT and a CLIENT from a customer service call.

Please:
- Suggest improvements in wording, tone, or clarity.
- Highlight any parts that sound unnatural or redundant.
- Provide rewritten versions where necessary.
- Keep your suggestions concise and professional.
The language can be hindi, english or odia.+
Transcribed Dialogue:\n\n"${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
//perfect code

  app.post("/uploadsample", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const audioPath = req.file.path;
      const form = new FormData();
      form.append("audio", fs.createReadStream(audioPath));
  
      const response = await axios.post("https://56bc-34-126-132-18.ngrok-free.app/analyze", form, {
        headers: form.getHeaders(),
      });
  
      const dialogue = response.data.dialogue;
      const rating = response.data.rating;
  
      const suggestions = await getImprovementSuggestions(dialogue);
  
      res.render("output", {
        dialogue,
        rating,
        suggestions,
      });
  
    } catch (error) {
      console.error("❌ Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });



// app.post("/uploadsample", upload.single("audio"), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//       }
  
//       const audioPath = req.file.path;
//       const form = new FormData();
//       form.append("audio", fs.createReadStream(audioPath));
  
//       const response = await axios.post("https://4f2a-34-125-67-115.ngrok-free.app/analyze", form, {
//         headers: form.getHeaders(),
//       });
  
//       const { dialogue, rating, labels } = response.data;
  
//       const suggestions = await getImprovementSuggestions(dialogue);
  
//       // Write labels to JSON file
//       fs.writeFileSync("labels.json", JSON.stringify({ labels }, null, 2));
  
//       // Call Python script
//       const python = spawn("python3", ["app.py"]);
  
//       let pythonData = "";
//       python.stdout.on("data", (data) => {
//         pythonData += data.toString();
//       });
  
//       python.stderr.on("data", (data) => {
//         console.error(`Python error: ${data}`);
//       });
  
//       python.on("close", (code) => {
//         console.log(`Python script finished with code ${code}`);
//         const deadAirOutput = JSON.parse(pythonData);
  
//         res.render("output", {
//           dialogue,
//           rating,
//           suggestions,
//           deadAir: deadAirOutput, // You can use this in the EJS page
//         });
//       });
  
//     } catch (error) {
//       console.error("❌ Error:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   });









// app.post("/uploadsample", upload.single("audio"), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//       }
  
//       const audioPath = req.file.path;
//       console.log(audioPath);
//       const form = new FormData();
//       form.append("audio", fs.createReadStream(audioPath));
  
//       const response = await axios.post(" https://4f2a-34-125-67-115.ngrok-free.app/analyze", form, {
//         headers: form.getHeaders(),
//       });
        
//     //   res.json(response.data);
//      res.render('output', { dialogue: response.data.dialogue, rating: response.data.rating });



//     } catch (error) {
//       console.error("❌ Error communicating with Flask:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   });
  
  





// ✅ Start Server
app.listen(3000, () => console.log("App is listening on port 3000"));
