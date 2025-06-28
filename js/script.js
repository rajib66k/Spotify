let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 🔧 Now fetch songs.json instead of reading folder
async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`/Spotify/${currFolder}/songs.json`);
    songs = await response.json();
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/Spotify/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfoname").innerHTML = decodeURI(track);

    const coverImgElement = document.querySelector(".current-cover");
    if (coverImgElement) {
        coverImgElement.src = `/Spotify/${currFolder}/cover.jpeg`;
    }
}

function updatePlaylistUI() {
    let songUl = document.querySelector(".playlist ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li>
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <div class="info">
                <img class="current-cover" src="/Spotify/${currFolder}/cover.jpeg" alt="Cover Art">
                <div class="invisible">${song}</div>
                <div class="visible">${song.replace(".mp3", "").replaceAll("_", " ").replaceAll("-", " ")}</div>
                <p>${song.split(" - ")[0]}</p>
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".playlist li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".invisible").innerHTML);
        });
    });
}

async function displayAlbums() {
    // 🔧 FIXED: Use index.json instead of broken folder fetch
    let response = await fetch(`/Spotify/songs/index.json`);
    let folders = await response.json();

    let bigalbum = document.querySelector(".bigalbum");

    for (const folder of folders) {
        try {
            let res = await fetch(`/Spotify/songs/${folder}/info.json`);
            let info = await res.json();

            bigalbum.innerHTML += `<div class="album" data-folder="${folder}">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="info">
                    <img src="/Spotify/songs/${folder}/cover.jpeg" alt="">
                    <div class="invisible1"></div>
                    <div class="visible">${info.description}</div>
                    <p>${info.title}</p>
                </div>
            </div>`;
        } catch (err) {
            console.error(`Error loading album ${folder}:`, err);
        }
    }

    setTimeout(() => {
        Array.from(document.getElementsByClassName("album")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                updatePlaylistUI();
                if (songs.length > 0) {
                    playMusic(songs[0], true);
                }
            });
        });
    }, 100);
}

async function main() {
    await getSongs("songs/dil");
    updatePlaylistUI();
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".box1").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".box1").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
}

main();