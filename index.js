

const express = require("express")
const cors = require("cors")
const { spawnSync } = require("child_process");
const app = express()
app.use(cors())
app.use(express.json())
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const codeGenerator = async (input, code) => {
    const messages = [{ role: "user", content: code }, { role: "assistant", content: input }];
    try {
        if (!code) throw new Error("No input is provided")

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        // console.log(completion.data.choices[0].message.content)
        return JSON.stringify(completion.data.choices[0].message.content)
    } catch (error) {
        console.error('Error:', error);
    }
}


app.post("/runCode", async (req, res) => {
    const { input } = req.body;
  
    try {
      if (!input) {
        throw new Error("No input provided");
      }
  
      const output = executeCode(input);
      console.log("Output from backend:", output);
      res.json((output)) 


    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
});

  const executeCode = (code) => {
    try {
      let capturedOutput = '';
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        capturedOutput += args.join(' ') ;
        originalConsoleLog(...args);
      };
  
      eval(code);
  
      console.log = originalConsoleLog; // Restore original console.log
      return capturedOutput;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };
  

app.post("/convert", async (req, res) => {
    const language = req.query.language
    const input = req.body.input
    let response = await codeGenerator(`Convert a code from current language to ${language} language every line should in new line`, input);
    console.log(response);
    res.send(response)

})

app.post("/debug", async (req, res) => {
    const input = req.body.input
    let response = await codeGenerator(`Please Debug the code that is ${input} if there is any error, and explain step by step process to correct it.`, input);
    res.send(response)

})

app.post("/qualityCheck", async (req, res) => {
    const input = req.body.input
    let response = await codeGenerator(`Please Check the quality of code that is ${input} if there is any possiblity to optimize the code then give some tips to inprove it`, input);
    res.send(response)
})

app.listen(8080, () => {
    console.log("server is running at 8080")
}
)

module.export = app