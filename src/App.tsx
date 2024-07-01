import axios from "axios";
import * as cheerio from "cheerio";
import { useState } from "react";

type SSSTik = {
  avatar?: string;
  thumbnail: string;
  description: string;
  username: string;
  likeCount: string;
  commentCount: string;
  shareCount: string;
  images?: string[];
  no_wm: string;
  mp3: string;
};

function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<SSSTik>();

  const [message, setMessage] = useState("");

  const getSStik = () =>
    axios
      .get("https://ssstik.io", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        },
      })
      .then(({ data }) => {
        const regex = /s_tt\s*=\s*["']([^"']+)["']/;
        const match = regex.exec(data);
        return { status: "success", token: match![1] };
      });

  const handleDownloadButton = () =>
    new Promise(async (resolve, reject) => {
      const tt = await getSStik();

      if (tt.status != "success") {
        setMessage("Invalid Tiktok URL. Make sure your url is correct!");
      }

      axios("https://ssstik.io/abc?url=dl", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://ssstik.io",
          Referer: "https://ssstik.io" + "/en-1",
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        },
        data: new URLSearchParams(
          Object.entries({
            id: url,
            locale: "en",
            tt: tt.token,
          })
        ),
      })
        .then(({ data }: any) => setData(extract(data)))
        .catch((e) => setMessage(e.message));
    });

  function extract(input: string) {
    let $ = cheerio.load(input);
    let regex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    let res = regex.exec($("style").text());

    // Images / Slide Result
    const images: string[] = [];
    $("ul.splide__list > li")
      .get()
      .map((img) => {
        images.push($(img)!.find("a")!.attr("href")!.trim());
      });

    return {
      avatar: $(".result_author").attr("src"),
      thumbnail: res![0],
      description: $("p.maintext").text().trim(),
      username: $("h2").text().trim(),
      likeCount: $("#trending-actions > .justify-content-start").text().trim(),
      commentCount: $("#trending-actions > .justify-content-center")
        .text()
        .trim(),
      shareCount: $("#trending-actions > .justify-content-end").text().trim(),
      images: images,
      no_wm: $("a.without_watermark").attr("href")!.trim(),
      mp3: $("a.music").attr("href")!.trim(),
    };
  }

  function downloadHandler(url: string, extension: string) {
    fetch(url, {
      method: "GET",
      headers: {
        Origin: "https://ssstik.io",
        Referer: "https://ssstik.io" + "/en-1",
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
              <input
                type="text"
                id="default-input"
                onChange={(e) => setUrl(e.target.value)}
                className=" text-sm rounded-full block w-full p-2.5 pl-4 bg-zinc-800 border-zinc-600 placeholder-zinc-500 text-white"
                placeholder="https://www.tiktok.com/@account_name/video/9159722376380604406"
              />
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
              <img
                className="md:max-h-72 rounded-2xl mx-auto max-w-full sm:max-w-52 md:max-w-full"
                src={data.thumbnail}
                alt="image description"
              />
              <div className="flex flex-col gap-5">
                <div className="">
                  <h2 className="text-white">{data.description}</h2>
                  <span className="text-sm text-zinc-400">{data.username}</span>
                </div>
                <div>
                  <a
                    // href={data.no_wm}
                    onClick={() => downloadHandler(data.no_wm, "mp4")}
                    className="text-white font-medium rounded-full text-sm px-6 py-1.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
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
                    className="text-white font-medium rounded-full text-sm px-6 py-1.5 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
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
