const express = require("express");
const app = express();
const PORT = 8000;
app.use(express.json());


const routes = require("./routes");

app.use("/Public", express.static("Public"));
// app.use("/api",Routes);
app.use("/api/auth", routes.auth);
app.use("/api/blog", routes.blog);
app.use("/api/user", routes.user);


app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
  });

