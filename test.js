// const express = require("express");
// const axios = require("axios");
// const app = express();

// app.use(express.json());

// app.get("/",(req,res)=>{
//   res.render("try");
// })

// app.post("/uploadsample", async (req, res) => {
//   try {
//     const { audioPath } = req.body;

//     const flaskUrl = "https://dc3c-34-75-158-73.ngrok-free.app"; // include /analyze
//     const response = await axios.post(flaskUrl, { audio_path: audioPath });

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error communicating with Flask:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(3000, () => {
//   console.log("Express server running on http://localhost:3000");
// });