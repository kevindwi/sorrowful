import React, { useState } from "react";
import axios from "axios";
import * as cheerio from "cheerio";

function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState();

  const [message, setMessage] = useState("");

  const getSStik = () =>
    new Promise(async (resolve, _reject) => {
      await axios.get("http://localhost:5000/api/ssstik").then(({ data }) => {
        const regex = /s_tt\s*=\s*["']([^"']+)["']/;
        const match = regex.exec(data);
        resolve({ status: "success", token: match[1] });
      });
    });

  async function extract(input) {
    let $ = cheerio.load(input);
    let regex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    let res = regex.exec($("style").text());

    // Images / Slide Result
    const images = [];
    $("ul.splide__list > li")
      .get()
      .map((img) => images.push($(img).find("a").attr("href").trim()));

    // console.log(input);

    return {
      avatar: $(".result_author").attr("src"),
      thumbnail: res[0],
      description: $("p.maintext").text().trim(),
      username: $("h2").text().trim(),
      likeCount: $("#trending-actions > .justify-content-start").text().trim(),
      commentCount: $("#trending-actions > .justify-content-center")
        .text()
        .trim(),
      shareCount: $("#trending-actions > .justify-content-end").text().trim(),
      images: images,
      no_wm: $("a.without_watermark").attr("href").trim(),
      mp3: $("a.music").attr("href").trim(),
    };
  }

  const handleDownloadButton = () =>
    new Promise(async (_resolve, _reject) => {
      const tt = await getSStik();
      const token = tt.token;
      // console.log(token);

      if (tt.status !== "success") {
        setMessage("Invalid Tiktok URL. Make sure your url is correct!");
      }

      await axios
        .post("http://localhost:5000/api/ssstik", {
          url,
          token,
        })
        .then(async (response) => {
          // console.log(response.data.status);
          if (response.data.status === "failed") {
            setTimeout(function () {
              handleDownloadButton();
            }, 1000);
          } else {
            const ex = await extract(response.data);
            setData(ex);
          }
        })
        .catch((e) => {
          // console.log(e);
          setMessage(e.message);
        });
    });

  function downloadHandler(url, extension) {
    fetch(url, {
      method: "GET",
      headers: {
        Origin: "https://ssstik.io",
        Referer: "https://ssstik.io/en-1",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");

        const randomNumber = Math.floor(100000 + Math.random() * 90000000000);

        link.href = url;
        link.setAttribute(
          "download",
          "sorrowful_" + randomNumber + "." + extension
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
  }

  return (
    <div className=" min-h-screen bg-zinc-950 px-4 pb-10">
      <div className="flex items-center w-full h-14">
        <div className="text-2xl font-medium text-white">Sorrowful</div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-medium mt-12 mb-3">
            Download TikTok videos in just one click
          </h1>
        </div>

        <div className="w-full sm:w-[80%] md:w-[80%] h-full bg-zinc-900 rounded-[40px] my-5 px-6 py-6">
          <div className="w-full">
            <span className="text-red-500">{message}</span>
            <div className="flex flex-col md:flex-row md:items-center justify-center gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  id="default-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="!outline-none text-sm caret-white rounded-full block w-full p-2.5 pl-4 pr-10 bg-zinc-800 border-zinc-600 placeholder-zinc-500 text-white"
                  placeholder="Your link goes here"
                />
                <div className="absolute cursor-pointer inset-y-0 right-0 flex items-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-white hover:text-zinc-400"
                    onClick={() => setUrl("")}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadButton}
                className="text-white font-medium rounded-full text-sm px-6 py-2.5 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
              >
                Download
              </button>
            </div>
          </div>

          {data && (
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="md:max-h-72 max-w-full sm:max-w-52">
                <img
                  className=" rounded-2xl h-full"
                  src={data.thumbnail}
                  alt="description"
                />
              </div>
              <div className="flex flex-col gap-5">
                <div className="">
                  <h2 className="text-white">{data.description}</h2>
                  <span className="text-sm text-zinc-400">{data.username}</span>
                </div>
                <div>
                  <a
                    // href={data.no_wm}
                    onClick={() => downloadHandler(data.no_wm, "mp4")}
                    className="cursor-pointer text-white font-medium rounded-full text-sm px-6 py-1.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
                  >
                    No WM
                  </a>
                  {/* <a
                    href={data.no_wm}
                    className="text-white font-medium rounded-full text-sm px-6 py-1.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
                  >
                    With WM
                  </a> */}
                  <a
                    onClick={() => downloadHandler(data.mp3, "mp3")}
                    className="cursor-pointer text-white font-medium rounded-full text-sm px-6 py-1.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
                  >
                    MP3
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
