const $ = require('jquery');
const electron = require('electron');
const { remote, shell, ipcRenderer } = electron;
const path = require('path');
const fs = require('fs');
const FileManager = require(path.join(__dirname, '/js/FileManager.js'));
var socketurl = "http://66.70.129.63:3000"
const socket = require('socket.io-client')(socketurl);
const ss = require('socket.io-stream');
const os = require('os');
var MojangAPI = require('mojang-api');
var ygg = require('yggdrasil')({
    host: 'https://authserver.mojang.com'
});
const Launcher = require(path.join(__dirname, '/js/Launcher.js'))

var filename = path.join(os.tmpdir(), "pixel");

var current = "signin"


const minecraft_folder = os.type == "Linux" ? path.join((electron.app || electron.remote.app).getPath('userData'), "..", "..", ".minecraft")
    : path.join((electron.app || electron.remote.app).getPath('userData'), "..", ".minecraft");

const datafile = new FileManager({
    configName: 'data',
    defaults: {
        "account": {
            "email": "",
            "username": "",
            "accessToken": "",
            "image": "",
            "from": ""
        }
    }
});
const accountfile = new FileManager({
    configName: 'accounts',
    defaults: {
        "current": 0,
        "accounts": []
    }
});

window.onclick = function (event) {
    if (!event.target.matches('#accountstrigger')) {
        var dropdowns = document.getElementsByClassName("dropbox");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('active')) {
                openDropdown.classList.remove('active');
                var bar = document.getElementById("accounts-menu");
                bar.setAttribute("accounts", Array.from(accountfile.data.accounts).length)
            }
        }
    }
    if (event.target.matches("#modal-account")) {
        event.target.classList.add("invisible")
    }
}
$(() => {
    if (!fs.existsSync(path.join(os.tmpdir(), "pixel"))) fs.mkdirSync(path.join(os.tmpdir(), "pixel"));

    update();
    var versions_folder = path.join(minecraft_folder, "versions")
    mountVersions(versions_folder)


})

function mountVersions(folderpath) {
    const files = fs.readdirSync(folderpath);
    files.forEach((f, key) => {
        var fullpath = path.join(folderpath, f);
        var input = ` <div class="select-box__value">
        <input class="select-box__input" type="radio" id="${key}" value="${key}"  name="Ben" checked="checked" />
        <p class="select-box__input-text">${f}</p>
      </div>`

        var li = `<li>
      <label class="select-box__option" for="${key}"  aria-hidden="aria-hidden">${f}</label>
    </li>`

        $(input).appendTo(".select-box__current")

        $(li).appendTo(".select-box__list");
    })
}

function update() {

    mountAccounts(accountfile.data)

    if (datafile.data.account.accessToken === "") {
        current = "signin";
        updateMount();
    } else {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        if (datafile.data.account.accessToken === "invited") {
            current = "account"
            document.getElementsByClassName("background")[0].setAttribute("state", current)
            document.getElementById("account-username").innerText = datafile.data.account.username
            document.getElementById("pixel-username").innerHTML = "<span>Username:</span> " + datafile.data.account.username
            document.getElementById("pixel-email").innerHTML = "<span>Email:</span> Invited account"
            var date = datafile.data.account.from;
            var mDate = new Date(date)
            document.getElementById("pixel-from").innerHTML = "<span>Sign in from:</span> " + months[mDate.getMonth()] + " " + mDate.getDay() + ", " + mDate.getFullYear() + " - " + (mDate.getHours().toFixed().length == 1 ? "0" + mDate.getHours() : mDate.getHours()) + ":" + (mDate.getMinutes().toFixed().length == 1 ? "0" + mDate.getMinutes() : mDate.getMinutes())
            updateMount();
        } else {
            authenticate(datafile.data.account.accessToken).then((account) => {
                current = "home"
                document.getElementsByClassName("background")[0].setAttribute("state", current)
                document.getElementById("account-username").innerText = datafile.data.account.username
                document.getElementById("pixel-username").innerHTML = "<span>Username:</span> " + datafile.data.account.username
                document.getElementById("pixel-email").innerHTML = "<span>Email:</span> " + datafile.data.account.email
                var date = datafile.data.account.from;
                var mDate = new Date(date)
                document.getElementById("pixel-from").innerHTML = "<span>Sign in from:</span> " + months[mDate.getMonth()] + " " + mDate.getDay() + ", " + mDate.getFullYear() + " - " + (mDate.getHours().toFixed().length == 1 ? "0" + mDate.getHours() : mDate.getHours()) + ":" + (mDate.getMinutes().toFixed().length == 1 ? "0" + mDate.getMinutes() : mDate.getMinutes())
                updateMount();

            }, (json) => {
                current = "signin";
                updateMount();
            })
        }
    }

}

function mountAccounts(file) {
    var div = document.querySelector("#accountdropbox > ul");
    div.innerHTML = ""
    var bar = document.getElementById("accounts-menu");
    bar.setAttribute("accounts", Array.from(accountfile.data.accounts).length)
    if (file.accounts.length > 0) {
        Array.from(file.accounts).forEach((a, key) => {
            var li;
            if (key === file.current) {
                var li = `<li current id=${"account-" + key}    ><img id="player-image" src=${"https://minotar.net/avatar/" + a.username} alt="">
                <h3 id="player-playername">${a.username}</h3>
                <div class="ext-acc-controls">
                <a key="${key}" id=${"use-" + key} title="use account" class="fas fa-mouse-pointer"></a>
                <a key="${key}" id=${"remove-" + key} title="remove account" class="fas fa-times"></a>
                </div>
                </li>`
                document.getElementById("player-playername").innerText = a.username
                document.getElementById("player-image").src = `https://minotar.net/bust/${a.username}/64`
                document.getElementById("model-name").innerHTML = `${a.username} <span>${a.uuid}</span`
                reloadSkinTexture(`http://crafatar.com/skins/${a.uuid}`);
            } else {
                var li = `<li id=${"account-" + key}><img id="player-image" src=${"https://minotar.net/avatar/" + a.username} alt="">
                <h3 id="player-playername">${a.username}</h3>
                <div class="ext-acc-controls">
                <a key="${key}" id=${"use-" + key} title="use account" class="fas fa-mouse-pointer"></a>
                <a key="${key}" id=${"remove-" + key} title="remove account" class="fas fa-times"></a>
                </div>
              </li>`
            }

            $(li).appendTo(div)
            document.getElementById("use-" + key).addEventListener("click", (e) => {
                accountfile.set("current", key)
                mountAccounts(accountfile.data)
            })
            document.getElementById("remove-" + key).addEventListener("click", (e) => {
                const ss = file.accounts.filter((v, i) => { return i != key })
                accountfile.set("accounts", ss)
                accountfile.set("current", (ss.length - 1))
                mountAccounts(accountfile.data)
            })
        })
    } else {
        document.getElementById("player-image").src = path.join(__dirname, "/assets/steve.png")
        accountfile.set("current", 0)
        reloadSkinTexture(path.join(__dirname, "/assets/skin-file.png"));
    }

}
function updateMount() {
    if (current === "signin") {
        $(".navbar").addClass("invisible")
        $(".player").addClass("invisible");
        document.getElementsByClassName("upper")[0].style.width = 50 + "px"
        document.getElementsByClassName("background")[0].setAttribute("state", current)
        changeView("signin")
    } else {
        $(".navbar").removeClass("invisible")
        $(".player").removeClass("invisible");
        Array.from($(".navbar").children()).forEach(e => {
            e.classList.remove("in")
            if (e.getAttribute("to") === current) {
                e.classList.add("in")
            }
            e.addEventListener("click", (b) => {
                Array.from($(".navbar").children()).forEach(s => { s.classList.remove("in") })
                b.target.classList.add("in")
                current = b.target.getAttribute("to")
                changeView(b.target.getAttribute("to"), "app")

            })
        })
        changeView(current, "mount")
        document.getElementsByClassName("upper")[0].removeAttribute("style")
        updateNavbar();
    }
}

function updateNavbar() {
    Array.from($(".navbar").children()).forEach(e => {
        e.classList.remove("in")
        if (e.getAttribute("to") === current) {
            e.classList.add("in")
        }
        e.addEventListener("click", (b) => {
            Array.from($(".navbar").children()).forEach(s => { s.classList.remove("in") })
            b.target.classList.add("in")
            current = b.target.getAttribute("to")
            changeView(b.target.getAttribute("to"), "app")

        })
    })
}
Array.from($(".navbar").children()).forEach(e => {
    e.classList.remove("in")
    if (e.getAttribute("to") === current) {
        e.classList.add("in")
    }
    e.addEventListener("click", (b) => {
        Array.from($(".navbar").children()).forEach(s => { s.classList.remove("in") })
        b.target.classList.add("in")
        current = b.target.getAttribute("to")
        changeView(b.target.getAttribute("to"), "app")

    })
})
console.log(os.userInfo());

document.getElementById("s-pc").innerHTML = `<h2>PC</h2><h5>${os.cpus().length} x <span>${os.cpus()[0].model}</span></h5>
<h5>${Math.round(os.totalmem().toFixed() / 1000000000)}GB RAM</h5> <h5>${os.type} - ${os.release} - ${os.platform} - ${os.arch}</h5>`

function changeView(view) {
    Array.from(document.getElementById('app').children).forEach(e => {
        e.classList.add('invisible')
    })
    document.getElementById(view).classList.remove('invisible');
    document.getElementsByClassName("background")[0].setAttribute("state", view)
    current = view;
    updateNavbar();
}
document.getElementById('close').addEventListener('click', () => {
    var win = remote.getCurrentWindow();
    win.close();

})

document.getElementById('minimize').addEventListener('click', () => {
    var win = remote.getCurrentWindow();
    win.minimize();
    launcher.destroy();
})

document.getElementById("signin-form").addEventListener("submit", (e) => {
    e.preventDefault();

    var email = document.getElementById("sg-email").value;
    var password = document.getElementById("sg-password").value;

    login(email, password).then((account) => {

        var userdata = account.user;

        datafile.set("account",
            {
                "email": userdata.email,
                "username": userdata.user,
                "accessToken": datafile.data.account.accessToken,
                "image": userdata.image,
                "from": Date.now()
            }
        );
        changeView("home", "mount")
        $(".navbar").removeClass("invisible")
        $(".player").removeClass("invisible");
        current = "home"


        document.getElementsByClassName("upper")[0].removeAttribute("style")
        updateNavbar();
        document.getElementsByClassName("background")[0].setAttribute("state", current)
        document.getElementById("account-username").innerText = datafile.data.account.username
        updateMount();
    }, (err) => {
        var errolog = document.getElementById("sg-error");
        errolog.innerText = err.msg;
        errolog.classList.add("unhidden")
    })

})

document.getElementById("accountstrigger").addEventListener("click", e => {
    var bar = document.getElementById("accounts-menu");
    var dropbox = document.getElementById("accountdropbox");
    if (dropbox.classList.contains("active")) {
        dropbox.classList.remove("active");
        bar.setAttribute("accounts", Array.from(accountfile.data.accounts).length)
    } else {
        dropbox.classList.add("active");
        bar.setAttribute("accounts", "0")
    }
})

function login(email, password) {
    return new Promise((resolve, reject) => {
        fetch("http://api.pixelclient.net/api/login", {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user: email, pass: password })
        }).then(res => { return res.json() })
            .then(json => {
                switch (json.code) {
                    case 200:
                        datafile.set("account", { "accessToken": json.accessToken })
                        fetch("http://api.pixelclient.net/api/user", {
                            method: "POST",
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ token: json.accessToken })
                        }).then(ress => { return ress.json() })
                            .then(jjson => {
                                resolve(jjson)
                            })
                        break;
                    case 510:
                        reject(json);
                        break
                    case 520:
                        reject(json);
                        break;
                    default:
                        break;
                }
            })
    });
}

function authenticate(auth) {

    return new Promise((resolve, reject) => {
        fetch("http://api.pixelclient.net/api/user", {
            method: "POST",
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: auth })
        })
            .then(res => { return res.json() })
            .then(json => {
                if (json.user) {
                    resolve(json.user)
                } else {
                    reject(json)
                }
            })
    });
}

document.getElementById("logout").addEventListener("click", (e) => {
    fetch("http://api.pixelclient.net/api/logout", {
        method: "POST",
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: datafile.accessToken })
    }).then(res => { return res.json() })
        .then(json => {
            datafile.set("account", {
                "email": "",
                "username": "",
                "accessToken": "",
                "image": ""
            })
            current = "signin";
            document.getElementById("account-username").innerText = ""
            document.getElementById("pixel-username").innerHTML = "<span>Username:</span>"
            document.getElementById("pixel-email").innerHTML = "<span>Email:</span>"
            updateMount();
        })
})


loadButtonsDownload();

const DecompressZip = require('decompress-zip');

var dataNames = [
    "assets", "libraries", "classes", "json", "main.class", "optifine", "patching", "pixel", "patching", "compiled", "deleting"
]

function loadButtonsDownload() {

    document.querySelectorAll(".start-button").forEach(a => {
        var stream = ss.createStream();
        var size = 0;
        const version = a.getAttribute("version")
        a.addEventListener("click", (e) => {
            console.log(version);

            let unzipper = new DecompressZip(path.join(filename, version + ".zip"));

            var parentElement = a.parentElement;
            var rand = Math.random();
            var el = `   <div class="profile-download">
        <div id="down-${rand}" class="profile-cr-download"><div></div></div>
        <span>Preparing Download</span>
      </div> <a id="stop-${rand}" class="far fa-stop-circle"></a>`

            parentElement.setAttribute("state", "downloading")
            e.target.parentElement.innerHTML = el;

            document.getElementById("stop-" + rand).addEventListener("click", (e) => {
                fs.unlinkSync(path.join(filename, version + ".zip"))
                stream.end();
            })
            ss(socket).emit('file', stream, function (fileInfo) {
                stream.pipe(fs.createWriteStream(path.join(filename, version + ".zip")));

                stream.on('data', (chunk) => {
                    size += chunk.length;
                    var porcentaje = Math.round((size / fileInfo.size) * 100) + '%'

                    document.getElementById("down-" + rand).nextElementSibling.innerText = dataNames[Math.round((size / fileInfo.size) * 10)] + " - " + porcentaje;
                    document.getElementById("down-" + rand).children[0].style.width = porcentaje

                });


                var startdiv = ` <div class="profile-stat-off">
            <button class="remove-button">REMOVE</button>
            <button class="start-button">START</button>
          </div>`

                stream.on('end', () => {
                    var porcentaje = Math.round((size / fileInfo.size) * 100);
                    if (porcentaje != 100) {
                        var downloadbtn = ` <button class="start-button">INSTALL</button>`
                        parentElement.innerHTML = downloadbtn;
                        loadButtonsDownload();
                    } else {
                        console.log(version);
                        unzipper.extract({
                            path: path.join(minecraft_folder, "versions")
                        });
                        unzipper.on('error', function (err) {
                            console.log('event error', err)
                            //fs.unlinkSync(path.join(filename, version + ".zip"))
                        });

                        unzipper.on('extract', function (log) {
                            parentElement.innerHTML = startdiv;
                            // fs.unlinkSync(path.join(filename, version + ".zip"))
                        });
                        unzipper.on('progress', function (fileIndex, fileCount) {
                            var percent = Math.round((fileIndex / fileCount) * 100) + "%"
                            document.getElementById("down-" + rand).nextElementSibling.innerText = "unziping - " + percent;
                            document.getElementById("down-" + rand).children[0].style.width = percent

                        });
                    }

                    stream = ss.createStream();
                    size = 0;
                });
            });


        })
    })

}


document.getElementById("add-account").addEventListener("click", (e) => {
    var modal = document.getElementById("modal-account");
    if (modal.classList.contains("invisible")) {
        modal.classList.remove("invisible");
        changeView("home")
    } else {
        modal.classList.add("invisible")
    }
})
var premiumform = document.getElementById("premium-account");
var nopremiumform = document.getElementById("nopremium-account");

document.getElementById("change-premium").addEventListener("click", (e) => {

    if (premiumform.classList.contains("invisible")) {
        premiumform.classList.remove("invisible");
        nopremiumform.classList.add("invisible")
        document.getElementById("change-premium").innerHTML = `No Premium? <i class="fas fa-angle-down"></i>`
    } else {
        nopremiumform.classList.remove("invisible");
        premiumform.classList.add("invisible")
        document.getElementById("change-premium").innerHTML = `Premium? <i class="fas fa-angle-up"></i>`
    }
})

premiumform.addEventListener("submit", (e) => {
    e.preventDefault();
    var email = e.target.children[0].value;
    var password = e.target.children[1].value;

    ygg.auth({
        agent: 'Minecraft',
        user: email,
        pass: password
    }, (err, data) => {
        if (err) {
            console.log(err.code);
            console.log(err.Error);

        } else {
            data.availableProfiles.forEach(d => {
                const exist = accountfile.data.accounts.find(acc => acc.username === d.name);
                if (!exist) {
                    var account = {
                        username: d.name,
                        accessToken: data.accessToken,
                        uuid: d.id,
                        legacy: true,
                        added: Date.now()
                    }
                    var bkp = accountfile.data.accounts
                    bkp.push(account);
                    accountfile.set("accounts", bkp);
                    mountAccounts(accountfile.data)
                    updateNavbar();
                    var modal = document.getElementById("modal-account");
                    modal.classList.add("invisible")
                }

            })
        }
    })
})

nopremiumform.addEventListener("submit", (e) => {

    e.preventDefault();
    var nickname = e.target.children[0].value;
    var uuid = uuidv4().replace('-', "");
    var accessToken = uuidv4().replace('-', "");
    console.log(accountfile.data.accounts);

    const exist = accountfile.data.accounts.find(acc => acc.username === nickname);

    if (!exist) {
        if (!speacialsChars(nickname)) {
            if (nickname.length < 13 && nickname.length > 3) {
                MojangAPI.nameToUuid(nickname, (err, res) => {
                    var account;
                    if (err) {
                        account = {
                            username: nickname,
                            accessToken: accessToken.replace('-', ""),
                            uuid: uuid,
                            legacy: false,
                            added: Date.now()
                        }
                    } else {
                        account = {
                            username: res[0] ? res[0].name : nickname,
                            accessToken: accessToken.replace('-', ""),
                            uuid: res[0] ? res[0].id : uuid,
                            legacy: false,
                            added: Date.now()
                        }
                    }
                    var bkp = accountfile.data.accounts
                    bkp.push(account);
                    accountfile.set("accounts", bkp);
                    mountAccounts(accountfile.data)
                    updateNavbar();
                    var modal = document.getElementById("modal-account");
                    modal.classList.add("invisible")
                })

            }
        }
    }

})

onCancel();

function onCancel() {
    nopremiumform.addEventListener("reset", (e) => {
        var modal = document.getElementById("modal-account");
        modal.classList.add("invisible")
    })
    premiumform.addEventListener("reset", (e) => {
        var modal = document.getElementById("modal-account");
        modal.classList.add("invisible")
    })
}

function uuidv4() {
    return ([1e7] + 1e3 + 4e3 + 8e4 + 1e10).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 2).toString(16)
    )
}

function speacialsChars(nick) {
    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return format.test(String(nick).toLocaleLowerCase());
}

document.getElementById("sg-without").addEventListener("click", (e) => {
    var sg = document.getElementById("signin-form");
    var sgw = document.getElementById("signin-wihout");

    if (sg.classList.contains("invisible")) {
        sg.classList.remove("invisible");
        sgw.classList.add("invisible")
        document.getElementById("sg-without").innerHTML = `Sign in without account <i class="fas fa-angle-right"></i>`
    } else {
        sgw.classList.remove("invisible");
        sg.classList.add("invisible")
        document.getElementById("sg-without").innerHTML = `Sign in with Pixel account <i class="fas fa-angle-right"></i>`
    }
})

document.getElementById("signin-wihout").addEventListener("submit", (e) => {
    e.preventDefault();
    datafile.set("account",
        {
            "email": "",
            "username": document.getElementById("sg-username").value,
            "accessToken": "invited",
            "image": "",
            "from": Date.now()
        }
    );
    changeView("home", "mount")
    $(".navbar").removeClass("invisible")
    $(".player").removeClass("invisible");
    current = "home"

    document.getElementsByClassName("upper")[0].removeAttribute("style")
    updateNavbar();
    document.getElementsByClassName("background")[0].setAttribute("state", current)
    document.getElementById("account-username").innerText = datafile.data.account.username
    updateMount();
})
var launcher

document.getElementById("play-game").addEventListener("click", (e) => {
    var target = e.target;
    var sl = $(".select-box__input:checked")[0];
    var accounts = accountfile.data;
    var account = accounts.accounts[accounts.current]
    launcher = new Launcher(sl.nextElementSibling.innerText, account, "/home/emir/Documents/natives", { xmx: 1000, xmn: 128 })
    launcher.launch();

})