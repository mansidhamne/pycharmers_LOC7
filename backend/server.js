const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
const AuthController = require('./controllers/AuthController');
const AuthRoutes = require('./routes/authRoutes');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
// Load environment variables
dotenv.config();
const Reimburse = require('./models/Reimburse');
const fs = require('fs');
const path = require('path');
// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function uploadToGemini(path, mimeType) {
    const uploadResult = await fileManager.uploadFile(path, {
      mimeType,
      displayName: path,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }

  async function waitForFilesActive(files) {
    console.log("Waiting for file processing...");
    for (const name of files.map((file) => file.name)) {
      let file = await fileManager.getFile(name);
      while (file.state === "PROCESSING") {
        process.stdout.write(".")
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(name)
      }
      if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`);
      }
    }
    console.log("...all files ready\n");
  }

// Configuration for the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Specify the model you want to use
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Use user routes
app.use('/auth', AuthRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/reimburse', async (req, res) => {
    try {
        const newReimburse = new Reimburse(req.body);
        await newReimburse.save();
        res.status(201).json({ message: "Reimbursement request stored", data: newReimburse });
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
      }
});

app.post('/save_summary', async (req, res) => {
    try {
        const summary = req.body.summary;
        if (!summary) {
            return res.status(400).json({ error: "Summary is required" });
        }
        console.log(summary)

        const summaryPath = path.join(__dirname, 'summary.json');
        fs.writeFile(summaryPath, JSON.stringify({ summary }, null, 2), (err) => {
            if (err) {
                console.error("File write error:", err);
                return res.status(500).json({ error: "File write error" });
            }
            res.status(201).json({ message: "Summary saved successfully" });
        });
    } catch (error) {
        console.error("Processing error:", error);
        res.status(500).json({ error: "Processing error" });
    }
});

app.get('/fetch_bill_details', async (req, res) => {
    try {
        const reimburse = await Reimburse.find().populate('bill');
        res.status(200).json(reimburse);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
});


app.post("/chat", async (req, res) => {
    const files = [
        await uploadToGemini("policies.json", "text/plain"),
    ];
    await waitForFilesActive(files);
    try {
      const { message } = req.body;  // Get message from the client
  
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }
  
      // Start a chat session with the Gemini model
      const chatSession = model.startChat({
        generationConfig,
        history: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    mimeType: files[0].mimeType,
                    fileUri: files[0].uri,
                  },
                },
                {text: "based on these answer questions in an interactive manner\n"},
              ],
            },
            {
              role: "model",
              parts: [
                {text: "Okay, I'm ready to answer your questions about the Employee Reimbursement Policy.  Ask away!  I'll do my best to provide accurate and concise answers based on the provided JSON data.\n"},
              ],
            },
            {
                role: "user",
                parts: [
                    {text: "I am employee 1, I want to know the reimbursement policy for the manager.\n"},
                ],
            }, 
            {
                role: "model",
                parts: [
                    {text: "If the user identifies as an employee, only provide information related to their own allowance. If they ask about someone else's allowance, politely inform them that they don't have permission. If the user is an HR or CEO they may access others' information"},
                ],
            }
          ],
      });
      // Send the message to Gemini API and get the response
      const result = await chatSession.sendMessage(message);
  
      // Return the generated response from Gemini API
      res.status(200).json({
        message: result.response.text(),
      });
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      res.status(500).json({ error: "Failed to communicate with Gemini API" });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});