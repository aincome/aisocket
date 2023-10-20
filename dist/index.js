import dotenv from "dotenv";
import { textGenerationStream } from "@huggingface/inference";
import { Server } from "socket.io";
dotenv.config();
const port = parseInt(process.env.AISOCKET_PORT || "3000");
const io = new Server(port);
io.on("connection", (socket) => {
    socket.on("input", async (input) => {
        const prompt = process.env.AISOCKET_PROMPT?.replace("${input}", input) || input;
        let response = "";
        try {
            for await (const output of textGenerationStream({
                model: process.env.AISOCKET_MODEL || "gpt2",
                inputs: prompt,
                parameters: {
                    max_new_tokens: parseInt(process.env.AISOCKET_MAX_NEW_TOKENS || "200"),
                    temperature: parseInt(process.env.AISOCKET_TEMPERATURE || "1"),
                    repetition_penalty: parseFloat(process.env.AISOCKET_REPETITION_PENALTY || "1.03"),
                    top_k: parseInt(process.env.AISOCKET_TOP_K || "10"),
                    top_p: parseFloat(process.env.AISOCKET_TOP_P || "0.95"),
                    stop_sequences: ["</s>"],
                },
            }, {
                use_cache: false,
            })) {
                const token = output.token.text.replace("</s>", "");
                response += token;
                socket.emit("token", token);
            }
            socket.emit("response", response.trim());
        }
        catch (err) {
            console.error(err);
            socket.emit("error", err);
        }
    });
});
console.log(`AISocket server running on port ${port}`);
