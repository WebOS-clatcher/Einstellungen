class Settings extends Layer {
    constructor() {
        super("Einstellungen", "fas fa-toolbox", 500);

        this.container = document.createElement("div");
        this.container.style.cssText = `
            max-height: 500px;
            overflow-y: auto;
        `;

        const logoHeader = this.render(`
            <div class="mt-15">
                <img id="logo-header" class="user-logo mt-15 mb-15" style="transform: scale(3); border-radius: 50%;" width="30" height="30" src="/pics/default.png">
                <p id="username" class="mt-15 mb-15" style="font-size: 16pt; font-weight: bold;"></p>
                <a href="javascript:void(0)" id="logout" style="font-size: 16pt">Logout</a>
            </div>
        `);

        this.logo = logoHeader.querySelector("#logo-header");
        this.username = logoHeader.querySelector("#username");
        this.logout = logoHeader.querySelector("#logout");
        this.logout.addEventListener("click", () => {
            fetch("/log/out", {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                new Toast(data.info).show();
                if(data.code === 200)
                    document.dispatchEvent(options.events.onLogout);
            });
        });

        this.container.appendChild(logoHeader);

        const updateLogo = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none">Avatar</legend>
                <div class="input-group">
                    <label id="avatar-label" class="clatcher-btn">
                        <i class="far fa-image"></i>
                        <input style="display: none;" id="avatar" type="file">
                    </label>
                    <button id="avatar-upload" class="clatcher-btn">Senden</button>
                </div>
            </fieldset>
        `);

        this.avatarLabel = updateLogo.querySelector("#avatar-label");
        this.avatar = updateLogo.querySelector("#avatar");
        this.avatarUpload = updateLogo.querySelector("#avatar-upload");

        this.avatarCurrentFile = document.createTextNode("Keine Datei ausgewählt");
        this.avatarLabel.appendChild(this.avatarCurrentFile);
        this.avatar.addEventListener("change", () => {
            this.avatarCurrentFile.textContent = this.avatar.files[0].name;
        });

        this.avatarUpload.addEventListener("click", () => {
            const file = this.avatar.files[0];

            if(!file) {
                new Toast("Keine Datei ausgewählt").show();
                return;
            }

            if(file.size > options.constants.MAX_LOGO_FILESIZE) {
                new Toast(`Maximal ${options.constants.MAX_LOGO_FILESIZE / (1024 * 1024)} MB`).show();
                this.avatarCurrentFile.textContent = "Keine Datei ausgewählt";
                this.avatar.value = "";
                return;
            }

            const fd = new FormData();
            fd.append("logo", file);
            this.avatarUpload.disabled = true;

            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/upload/logo");

            xhr.upload.addEventListener("progress", e => {
                if(e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    this.avatarUpload.textContent = `${percentComplete}%`;
                }
            });

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);
                
                if(response.code === 200) {
                    new Toast("Avatar aktualisiert").show();
                    options.user.logo = response.info;
                    document.dispatchEvent(options.events.logoChanged);
                }
                else {
                    new Toast(response.info).show();
                }

                this.avatarUpload.disabled = false;
                this.avatarUpload.textContent = "Senden";
                this.avatarCurrentFile.textContent = "Keine Datei ausgewählt";
                this.avatar.value = "";
            };

            xhr.onerror = () => {
                new Toast("Fehler beim Upload").show();
                this.avatarUpload.disabled = false;
                this.avatarUpload.textContent = "Senden";
                this.avatarCurrentFile.textContent = "Keine Datei ausgewählt";
                this.avatar.value = "";
            };

            xhr.send(fd);
        });

        this.container.appendChild(updateLogo);

        const updateBackground = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Hintergrund</legend>
                <div class="input-group">
                    <label id="background-label" class="clatcher-btn">
                        <i class="far fa-image"></i>
                        <input style="display: none;" id="background" type="file">
                    </label>
                    <button id="background-upload" class="clatcher-btn">Senden</button>
                </div>
            </fieldset>
        `);

        this.backgroundLabel = updateBackground.querySelector("#background-label");
        this.background = updateBackground.querySelector("#background");
        this.backgroundUpload = updateBackground.querySelector("#background-upload");

        this.backgroundCurrentFile = document.createTextNode("Keine Datei ausgewählt");
        this.backgroundLabel.appendChild(this.backgroundCurrentFile);
        this.background.addEventListener("change", () => {
            this.backgroundCurrentFile.textContent = this.background.files[0].name;
        });

        this.backgroundUpload.addEventListener("click", () => {
            const file = this.background.files[0];

            if(!file) {
                new Toast("Keine Datei ausgewählt").show();
                return;
            }

            if(file.size > options.constants.MAX_BACKGROUND_FILESIZE) {
                new Toast(`Maximal ${options.constants.MAX_BACKGROUND_FILESIZE / (1024 * 1024)} MB`).show();
                this.backgroundCurrentFile.textContent = "Keine Datei ausgewählt";
                this.background.value = "";
                return;
            }

            const fd = new FormData();
            fd.append("background", file);
            this.backgroundUpload.disabled = true;

            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/upload/background");

            xhr.upload.addEventListener("progress", e => {
                if(e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    this.backgroundUpload.textContent = `${percentComplete}%`;
                }
            });

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);

                if(response.code === 200) {
                    new Toast("Hintergrund aktualisiert").show();
                    wallpaper.setFile(response.info);
                    document.dispatchEvent(options.events.backgroundChanged);
                }
                else {
                    new Toast(response.info).show();
                }

                this.backgroundUpload.disabled = false;
                this.backgroundUpload.textContent = "Senden";
                this.backgroundCurrentFile.textContent = "Keine Datei ausgewählt";
                this.background.value = "";
            }

            xhr.onerror = () => {
                new Toast("Fehler beim Upload").show();
                this.backgroundUpload.disabled = false;
                this.backgroundUpload.textContent = "Senden";
                this.backgroundCurrentFile.textContent = "Keine Datei ausgewählt";
                this.background.value = "";
            };

            xhr.send(fd);
        });

        this.container.appendChild(updateBackground);

        const updateHeader = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Header</legend>
                <div class="input-group">
                    <label id="header-label" class="clatcher-btn">
                        <i class="far fa-image"></i>
                        <input style="display: none;" id="header" type="file">
                    </label>
                    <button id="header-upload" class="clatcher-btn">Senden</button>
                </div>
            </fieldset>
        `);

        this.headerLabel = updateHeader.querySelector("#header-label");
        this.header = updateHeader.querySelector("#header");
        this.headerUpload = updateHeader.querySelector("#header-upload");

        this.headerCurrentFile = document.createTextNode("Keine Datei ausgewählt");
        this.headerLabel.appendChild(this.headerCurrentFile);
        this.header.addEventListener("change", () => {
            this.headerCurrentFile.textContent = this.header.files[0].name;
        });

        this.headerUpload.addEventListener("click", () => {
            const file = this.header.files[0];

            if(!file) {
                new Toast("Keine Datei ausgewählt").show();
                return;
            }

            if(file.size > options.constants.MAX_HEADER_FILESIZE) {
                new Toast(`Maximal ${options.constants.MAX_HEADER_FILESIZE / (1024 * 1024)} MB`).show();
                this.headerCurrentFile.textContent = "Keine Datei ausgewählt";
                this.header.value = "";
                return;
            }

            const fd = new FormData();
            fd.append("header", file);
            this.headerUpload.disabled = true;

            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/upload/header");

            xhr.upload.addEventListener("progress", e => {
                if(e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    this.headerUpload.textContent = `${percentComplete}%`;
                }
            });

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);

                if(response.code === 200) {
                    new Toast("Header aktualisiert").show();
                    options.user.header = response.info;
                    document.dispatchEvent(options.events.headerChanged);
                }
                else {
                    new Toast(response.info).show();
                }

                this.headerUpload.disabled = false;
                this.headerUpload.textContent = "Senden";
                this.headerCurrentFile.textContent = "Keine Datei ausgewählt";
                this.header.value = "";
            };

            xhr.onerror = () => {
                new Toast("Fehler beim Upload").show();
                this.headerUpload.disabled = false;
                this.headerUpload.textContent = "Senden";
                this.headerCurrentFile.textContent = "Keine Datei ausgewählt";
                this.header.value = "";
            };

            xhr.send(fd);
        });

        this.container.appendChild(updateHeader);

        const loadPrivateThread = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Dein Content</legend>
                <div class="input-group">
                    <button id="load-thread" class="clatcher-btn">Thread laden</button>
                    <button id="usersite" class="clatcher-btn"></button>
                </div>
            </fieldset>
        `);

        const loadUsersiteListener = () => {
            options.usersite.name = options.user.username;
            document.dispatchEvent(options.events.loadUsersite);
        };

        const activateUsersiteListener = () => {
            fetch("/activate/publicsite", {
            method: "POST"
        })
        .then(response => response.json())
        .then(data => {
            new Toast(data.info).show();

                if(data.code === 200) {
                    options.user.usersite = 1;
                    this.usersite.textContent = "Lade Nutzerseite";
                    this.usersite.removeEventListener("click", activateUsersiteListener);
                    this.usersite.addEventListener("click", loadUsersiteListener);
                }
            });
        };

        this.loadThread = loadPrivateThread.querySelector("#load-thread");
        this.usersite = loadPrivateThread.querySelector("#usersite");

        this.loadThread.addEventListener("click", () => {
            options.privatethread.id = options.user.id;
            options.privatethread.username = options.user.username;
            options.privatethread.header = options.user.header;
            document.dispatchEvent(options.events.privateThreadChange);
        });

        this.container.appendChild(loadPrivateThread);

        this.captcha = this.render(`
            <fieldset style="display: none;">
                <legend style="text-align: left; user-select: none;">Captcha</legend>
                <p>Gib die einzelnen Zeichen unten in das Textfeld ein</p>
                <canvas id="canvas" style="background-color: gray;" width="300" height="150"></canvas><br>
                <button id="prev" class="clatcher-btn">&lt;&lt;</button>
                <input id="range" type="range" value="0" max="9">
                <button id="next" class="clatcher-btn">&gt;&gt;</button>
                <input id="code" class="mt-15 textfield clatcher-width" placeholder="Code hier eingeben, bestätige mit Enter">
            </fieldset>
        `);

        this.captchaFieldset = this.captcha.getElementsByTagName("fieldset")[0];
        this.captchaCanvas = this.captcha.querySelector("#canvas");
        this.captchaRange = this.captcha.querySelector("#range");
        this.captchaPrev = this.captcha.querySelector("#prev");
        this.captchaNext = this.captcha.querySelector("#next");
        this.captchaCode = this.captcha.querySelector("#code");

        this.captchaPrev.addEventListener("click", () => {
            if(this.captchaRange.value > 0) {
                this.captchaRange.value = this.captchaRange.value - 1;
                this.captchaRange.dispatchEvent(new Event("change"));
            }
        });

        this.captchaNext.addEventListener("click", () => {
            if(this.captchaRange.value < this.captchaRange.max) {
                this.captchaRange.value = parseInt(this.captchaRange.value) + 1;
                this.captchaRange.dispatchEvent(new Event("change"));
            }
        });

        this.captchaRange.addEventListener("change", () => {
            if(this.currentCode) {
                this.drawChar(parseInt(this.captchaRange.value));
            }
        });

        this.captchaCode.addEventListener("keydown", e => {
            if(e.key === "Enter") {
                const code = this.captchaCode.value;
                fetch(`/activate/email?ucode=${code}`, {
                    method: "PUT"
                })
                .then(response => response.json())
                .then(data => {
                    new Toast(data.info).show();

                    if(data.code === 200) {
                        options.user.activated = 1;
                        this.captchaFieldset.style.display = "none";
                    }
                });
            }
        });

        this.container.appendChild(this.captcha);

        const changePassword = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Passwort ändern</legend>
                <form>
                    <input name="oldpass" value="" type="password" class="textfield clatcher-width" placeholder="Aktuelles Passwort" required>
                    <input name="newpass1" value="" type="password" class="textfield clatcher-width mt-15" placeholder="Neues Passwort" required>
                    <input name="newpass2" value="" type="password" class="textfield clatcher-width mt-15" placeholder="Neues Passwort wiederholen" required>
                    <div class="input-group mt-15">
                        <input type="submit" value="Passwort ändern" class="clatcher-btn">
                        <input type="reset" value="Zurücksetzen" class="clatcher-btn">
                    </div>
                </form>
            </fieldset>
        `);

        this.passwordForm = changePassword.getElementsByTagName("form")[0];

        this.passwordForm.addEventListener("submit", e => {
            e.preventDefault();

            if(!this.passwordForm.checkValidity()) {
                new Toast("Bitte fülle alle Felder aus").show();
                return;
            }

            if(this.passwordForm.newpass1.value !== this.passwordForm.newpass2.value) {
                new Toast("Gib das neue Passwort zweimal ein").show();
                return;
            }

            fetch("/change/password", {
                method: "PUT",
                body: JSON.stringify({
                    oldpass: this.passwordForm.oldpass.value,
                    newpass1: this.passwordForm.newpass1.value,
                    newpass2: this.passwordForm.newpass2.value
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                new Toast(data.info).show();
                this.passwordForm.reset();
            });
        });

        this.container.appendChild(changePassword);

        const deleteAccount = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Account</legend>
                <div class="input-group">
                    <button id="delete-thread" class="clatcher-btn">Privaten Thread löschen</button>
                    <button id="delete-account" class="clatcher-btn bg-danger">Account löschen</button>
                </div>
            </fieldset>
        `);

        this.deleteThread = deleteAccount.querySelector("#delete-thread");
        this.deleteAccount = deleteAccount.querySelector("#delete-account");

        this.deleteThread.addEventListener("click", () => {
            fetch("/delete/privatethread", {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                new Toast(data.info).show();
            });
        });

        this.deleteAccount.addEventListener("click", async () => {
            if(!await new Confirm("Account wirklich löschen?").show()) return;
            if(!await new Confirm("Alle deine Daten gehen unwiederbringlich verloren!").show()) return;

            fetch("/delete/account", {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                new Toast("Account vollständig gelöscht").show();
                document.dispatchEvent(options.events.onLogout);
            });
        });

        this.container.appendChild(deleteAccount);

        const reportedPosts = this.render(`
            <fieldset>
                <legend style="text-align: left; user-select: none;">Gemeldete öffentliche Posts</legend>
                <button id="load-reports" class="clatcher-btn">Lade gemeldete Posts</button>
                <div id="reports"></div>
            </fieldset>
        `);

        this.loadReports = reportedPosts.querySelector("#load-reports");
        this.reports = reportedPosts.querySelector("#reports");
        this.objectURLs = [];

        this.loadReports.addEventListener("click", () => {
            fetch("/reported/comments", {
                method: "GET"
            })
            .then(response => response.json())
            .then(data => {
                if(data.code !== 200) {
                    new Toast(data.info).show();
                    return;
                }

                this.reports.innerHTML = "";

                data.info.forEach(elem => {
                    if(elem.reportbild !== null) {
                        const binary = atob(elem.reportbild);
                        const len = binary.length;
                        const bytes = new Uint8Array(len);

                        for(let i = 0; i < len; ++i) {
                            bytes[i] = binary.charCodeAt(i);
                        }

                        const blob = new Blob([bytes], { type: elem.reportmime });
                        this.objectURLs.push(URL.createObjectURL(blob));
                        elem.reportbild = this.objectURLs[this.objectURLs.length - 1];

                        elem.video = (elem.reportmime === "video/mp4") ? true : false;
                    }

                    elem.reporttext = Evaluate.youtube(elem.reporttext);
                    elem.reporttext = Evaluate.link(elem.reporttext);

                    const blockquote = document.createElement("blockquote");
                    blockquote.className = "ml-15 mr-15 mb-5 clatcher-width";
                    blockquote.style.borderLeft = "1px solid gray";
                    blockquote.style.paddingLeft = "15px";

                    const header = document.createElement("header");
                    header.style.cssText = `
                        margin: 0 0 1rem;
                        font-size: 80%;
                        color: #6c757d;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                    `;
                    blockquote.appendChild(header);

                    const reportedUserSpan = document.createElement("span");
                    reportedUserSpan.className = "mr-5";
                    reportedUserSpan.style.borderRight = "1px solid gray";
                    reportedUserSpan.style.paddingRight = "5px";
                    const reportedUserLink = document.createElement("a");
                    reportedUserLink.href = "javascript:void(0)";
                    reportedUserLink.textContent = elem.reportuser;
                    reportedUserLink.addEventListener("click", () => {
                        options.usersite.name = elem.reportuser;
                        document.dispatchEvent(options.events.loadUsersite);
                    });
                    reportedUserSpan.appendChild(reportedUserLink);
                    header.appendChild(reportedUserSpan);

                    const reasonSpan = document.createElement("span");
                    reasonSpan.className = "mr-5";
                    reasonSpan.style.borderRight = "1px solid gray";
                    reasonSpan.style.paddingRight = "5px";
                    reasonSpan.textContent = elem.grund;
                    header.appendChild(reasonSpan);

                    const dateSpan = document.createElement("span");
                    dateSpan.textContent = elem.date;
                    header.appendChild(dateSpan);

                    const textP = document.createElement("p");
                    textP.style.textAlign = "justify";
                    textP.innerHTML = elem.reporttext.replaceAll("\n", "<br>");
                    blockquote.appendChild(textP);

                    if(elem.video === true) {
                        const div = document.createElement("div");
                        div.className = "embed-responsive embed-responsive-16by9";
                        const video = document.createElement("video");
                        video.className = "embed-responsive-item";
                        video.controls = true;
                        const source = document.createElement("source");
                        source.src = elem.reportbild;
                        source.type = elem.reportmime;
                        video.appendChild(source);
                        div.appendChild(video);
                        blockquote.appendChild(div);
                    }
                    else if(elem.video === false) {
                        const div = document.createElement("div");
                        div.className = "embed-responsive embed-responsive-16by9";
                        const image = document.createElement("img");
                        image.style.cursor = "pointer";
                        image.className = "embed-responsive-item";
                        image.src = elem.reportbild;
                        image.addEventListener("click", () => {
                            new ImageViewer(image.src).show();
                        });
                        div.appendChild(image);
                        blockquote.appendChild(div);
                    }

                    const footer = document.createElement("footer");
                    footer.className = "mt-15";
                    footer.style.cssText = `
                        font-size: 80%;
                        color: #6c757d;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                    `;
                    blockquote.appendChild(footer);

                    const deleteSpan = document.createElement("span");
                    deleteSpan.className = "mr-5";
                    const deleteLink = document.createElement("a");
                    deleteLink.href = "javascript:void(0)";
                    deleteLink.textContent = "Löschen";
                    deleteLink.addEventListener("click", () => {
                        fetch(`/delete/comment?pid=${elem.postid}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            new Toast(data.info).show();

                            if(data.code === 200)
                                blockquote.remove();
                        });
                    });
                    deleteSpan.appendChild(deleteLink);
                    footer.appendChild(deleteSpan);

                    const validSpan = document.createElement("span");
                    const validLink = document.createElement("a");
                    validLink.href = "javascript:void(0)";
                    validLink.textContent = "Kein Regelverstoß";
                    validLink.addEventListener("click", () => {
                        fetch(`/delete/report?pid=${elem.postid}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            new Toast(data.info).show();

                            if(data.code === 200)
                                blockquote.remove();
                        });
                    });
                    validSpan.appendChild(validLink);
                    footer.appendChild(validSpan);

                    this.reports.appendChild(blockquote);
                });
            });
        });

        this.container.appendChild(reportedPosts);

        this.setBody(this.container);

        this.onStart = () => {
            this.logo.src = options.user.logo;
            this.username.textContent = options.user.username;

            if(options.user.activated === 0) {
                this.captchaFieldset.style.display = "block";
                this.captchaCode.value = "";
                this.captchaRange.value = 0;
                this.showCode();
            }
            else {
                this.captchaFieldset.style.display = "none";
            }

            if(options.user.usersite === 1) {
                this.usersite.textContent = "Lade Nutzerseite";
                this.usersite.addEventListener("click", loadUsersiteListener);
            }
            else {
                this.usersite.textContent = "Aktiviere deine Nutzerseite";
                this.usersite.addEventListener("click", activateUsersiteListener);
            }

            if(options.user.admin == 1 || options.user.op === 1) {
                reportedPosts.style.display = "block";
            }
            else {
                reportedPosts.style.display = "none";
                this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
                this.objectURLs = [];
                this.reports.innerHTML = "";
            }
        };

        this.onClose = () => {
            this.logo.src = "/pics/default.png";
            this.username.textContent = "Anonymous";

            this.avatarCurrentFile.textContent = "Keine Datei ausgewählt";
            this.avatar.value = "";

            this.backgroundCurrentFile.textContent = "Keine Datei ausgewählt";
            this.background.value = "";

            this.headerCurrentFile.textContent = "Keine Datei ausgewählt";
            this.header.value = "";

            this.passwordForm.oldpass.value = "";
            this.passwordForm.newpass1.value = "";
            this.passwordForm.newpass2.value = "";

            this.usersite.removeEventListener("click", loadUsersiteListener);
            this.usersite.removeEventListener("click", activateUsersiteListener);

            this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
            this.objectURLs = [];
            this.reports.innerHTML = "";
        };
    }

    showCode() {
        fetch("/send/activatecode", {
            method: "PUT"
        })
        .then(response => response.json())
        .then(data => {
            this.currentCode = data.info.split("");

            this.drawChar(0);
        });
    }

    drawChar(index) {
        const ctx = this.captchaCanvas.getContext("2d");

        ctx.clearRect(0, 0, this.captchaCanvas.width, this.captchaCanvas.height);

        ctx.save();

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = "black";
        ctx.font = "24pt Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        let x = 150;
        let y = 75;
        let degree = Math.random() * 80 - 40;

        ctx.translate(x, y);
        ctx.rotate(degree * Math.PI / 180);

        ctx.strokeText(this.currentCode[index], 0, 0);

        ctx.restore();
    }
}

manager.registerLayer({
    layer: new Settings(),
    where: options.layerVisibility.onlogin
});