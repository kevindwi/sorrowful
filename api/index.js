const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
// to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.get("/api/ssstik", async (req, res) => {
  try {
    const response = await axios.get("https://ssstik.io");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ssstik", async (req, res) => {
  let { url, token } = req.body;
  const params = new URLSearchParams();
  params.append("id", url);
  params.append("locale", "en");
  params.append("tt", token);

  await axios
    .post("https://ssstik.io/abc?url=dl", params, {
      headers: {
        Host: "ssstik.io",
        Origin: "https://ssstik.io",
        Referer: "https://ssstik.io/en-1",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7;application/json",
      },
    })
    .then((response) => {
      // console.log(response);
      if (response.data.length > 0) {
        res.send(response.data);
      } else {
        res.status(200).json({ status: "failed" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
