let currentSong = new Audio();

let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
    let text = await response.text();
    let div = document.createElement("div")
    div.innerHTML = text;
    let as = div.getElementsByTagName("a")

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".songinfoname").innerHTML = decodeURI(track)

    // ✅ NEW: Load and set cover image from current folder
    const coverImgElement = document.querySelector(".current-cover"); // You must add this <img>
    if (coverImgElement) {
        coverImgElement.src = `/${currFolder}/cover.jpeg`;
    }

}
// https://i.scdn.co/image/ab67616d00001e0226635c77bed7eb81e29fe1fa
function updatePlaylistUI() {
    let songUl = document.querySelector(".playlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="info">
                        <img class="current-cover" src="/${currFolder}/cover.jpeg" alt="Cover Art">
                        <div class="invisible">${song.replaceAll("%20", " ")}</div>
                        <div class="visible">${song.replaceAll("%20", " ").replaceAll("Diljit Dosanjh", "").replaceAll(".mp3", "").replaceAll("(Official Video)", "").replaceAll("(Official Music Video)", "").replace("-", "").replaceAll("_", "").trim()}</div>
                        <p>${song.replaceAll("%20", " ").split(" - ")[0]}</p>
                    </div>
                </li>`
    }

    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".invisible").innerHTML)
        })

    })
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let bigalbum = document.querySelector(".bigalbum")
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            bigalbum.innerHTML = bigalbum.innerHTML + `<div class="album" data-folder="${folder}">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="info">
                            <img src="/songs/${folder}/cover.jpeg" alt="">
                            <div class="invisible1"></div>
                            <div class="visible">${response.description}</div>
                            <p>${response.title}</p>
                        </div>
                    </div>`
            console.log(response);
        }
    })

    // ✅ FIX: Add event listeners after DOM is updated
    setTimeout(() => {
        Array.from(document.getElementsByClassName("album")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                updatePlaylistUI();
                if (songs.length > 0) { // ✅ FIX: Prevent empty song crash
                    playMusic(songs[0], true);
                }
            })
        });
    }, 100);
}

async function main() {

    await getSongs("songs/dil");
    updatePlaylistUI();    // Update UI after fetching songs
    if (songs.length > 0) {
        playMusic(songs[0], true);  // Fix
    }

    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".box1").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".box1").style.left = "-100%"
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // if (index > 0) {
        //     playMusic(songs[index - 1])
        // }
        if ((index - 1) >= length) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // if (index < songs.length - 1) {
        //     playMusic(songs[index + 1])
        // }
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    Array.from(document.getElementsByClassName("album")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            updatePlaylistUI();
            if (songs.length > 0) {
                playMusic(songs[0], true);
            }
        })
    })
}

main()