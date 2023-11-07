import express from "express";
import routes from "./routes";

const app = express();

app.use("/api", routes); // Mount the routes under the "/api" base path

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
