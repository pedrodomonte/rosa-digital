
const canvas = document.getElementById("roseCanvas");
const ctx = canvas.getContext("2d");

const intro = document.getElementById("intro");
const experience = document.getElementById("experience");
const startButton = document.getElementById("startButton");
const message = document.getElementById("message");
const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");

let width, height, dpr;
let started = false;
let progress = 0;
let lastFrame = 0;
let letterOpened = false;
let explosionActive = false;
let explosionStartedAt = 0;
let finalSurpriseShown = false;

const FPS = 30;
const FRAME_INTERVAL = 1000 / FPS;

const stemCanvas = document.createElement("canvas");
const flowerCanvas = document.createElement("canvas");

const stemCtx = stemCanvas.getContext("2d");
const flowerCtx = flowerCanvas.getContext("2d");

let particles = [];
let explosionParticles = [];

const symbols = ["@", "*", ":", ".", "+", "x", "%", "o"];

// TEXTO DA CARTA
const letterText = `
lorenna,

eu queria que você soubesse o quanto é especial pra mim. às vezes eu paro pra pensar em tudo que a gente já viveu e percebo que, no meio de tantos acontecimentos da vida, você acabou se tornando uma das minhas partes favoritas dela.

eu lembro do nosso primeiro beijo naquele shopping, de quando fomos assistir toy story, do jogo do cruzeiro e de tantos outros momentos que talvez pareçam pequenos, mas que guardo com um carinho enorme. são essas lembranças que me fazem sorrir sozinho e perceber o quanto sou feliz por ter vivido tudo isso com você.

também lembro da primeira vez que você disse que me amava. não sei se você consegue imaginar o quanto aquelas palavras significaram pra mim, mas eu nunca vou esquecer a sensação de ouvir aquilo vindo de você. foi um daqueles momentos que a gente gostaria de guardar num potinho pra poder sentir de novo sempre que quisesse.

e olha só, quem diria que toy story acabaria tendo um significado tão nosso? nosso famoso "eu te amo ao infinito e além". gosto de pensar que essa frase representa um pouquinho do que somos, porque, sinceramente, nem sei onde termina o tamanho do amor que sinto por você.

eu sei que não somos perfeitos. temos nossas diferenças, nossos dias difíceis e nossas discussões, mas eu não quero uma história perfeita, quero a nossa. quero continuar aprendendo com você, crescendo ao seu lado e encontrando motivos pra escolher você todos os dias.

ainda quero viver tanta coisa contigo. quero novos filmes, novos passeios, novas partidas, novas risadas e milhares de lembranças que ainda nem imaginamos. quero que um dia a gente olhe pra trás e perceba quanta coisa bonita construímos juntos.

obrigado por cada carinho, cada sorriso, cada abraço e por fazer parte da minha vida de uma maneira tão especial. obrigado por ser você e por me permitir fazer parte da sua história também.

se eu pudesse escolher novamente, entre todas as pessoas e todos os caminhos, ainda gostaria de encontrar você.

eu amo você, lorenna. talvez eu nunca consiga explicar perfeitamente esse sentimento, mas espero conseguir demonstrá-lo todos os dias.

e, como a gente sempre diz...
`;

// CONFIGURAÇÃO
function random(min, max) {
    return Math.random() * (max - min) + min;
}

function center() {
    return {
        x: width / 2,
        y: height * 0.36
    };
}

function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stemCanvas.width = width * dpr;
    stemCanvas.height = height * dpr;

    flowerCanvas.width = width * dpr;
    flowerCanvas.height = height * dpr;

    stemCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flowerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (started) buildRose();

    positionCenterButton();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// DESENHAR SÍMBOLOS
function drawSymbol(context, symbol, x, y, color, size, alpha = 1, glow = 0) {
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.font = `${size}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    if (glow) {
        context.shadowColor = color;
        context.shadowBlur = glow;
    }

    context.fillText(symbol, x, y);
    context.shadowBlur = 0;
}

// CAULE E FOLHAS
function buildStem() {
    stemCtx.clearRect(0, 0, width, height);

    const c = center();
    const stemLength = height * 0.35;

    for (let i = 0; i < 85; i++) {
        const t = i / 85;

        const x = c.x + Math.sin(t * 2.2) * 12;
        const y = c.y + t * stemLength;

        drawSymbol(
            stemCtx,
            ["|", "/", "\\", "l", "+", ":"][i % 6],
            x, y,
            i % 3 === 0 ? "#65a75c" : "#28753b",
            13, 0.9, 4
        );
    }

    for (const side of [-1, 1]) {
        for (let i = 0; i < 55; i++) {
            const t = i / 55;

            const x = c.x + side * t * 75;
            const y =
                c.y +
                stemLength * 0.58 -
                Math.sin(t * Math.PI) * 25 -
                t * 12;

            drawSymbol(
                stemCtx,
                ["*", "+", "/", "\\", "x"][i % 5],
                x, y,
                i % 3 === 0 ? "#6aaa56" : "#26783a",
                12, 0.9, 4
            );
        }
    }
}

// PÉTALAS
function buildFlower() {
    flowerCtx.clearRect(0, 0, width, height);

    const c = center();
    const maxRadius = Math.min(width * 0.29, height * 0.19);

    for (let layer = 0; layer < 11; layer++) {
        const radius = maxRadius * (0.28 + layer * 0.075);
        const rotation = layer * 0.16;

        for (let i = 0; i < 90; i++) {
            const angle = (Math.PI * 2 * i) / 90;

            for (let j = 1; j <= 10; j++) {
                const r = j / 10;

                const petal = Math.pow(
                    Math.max(0, Math.cos(5 * (angle + rotation))),
                    0.75
                );

                const boundary = radius * (0.28 + 0.72 * petal);
                const distance = r * radius;

                if (distance > boundary) continue;

                const x = c.x + Math.cos(angle) * distance;
                const y = c.y + Math.sin(angle) * distance * 0.82;

                const variation = Math.sin(angle * 3 + layer) * 12;

                const red = Math.min(255, 125 + layer * 12 + variation);
                const green = Math.max(5, 23 - layer);
                const blue = 30 + layer * 2;

                drawSymbol(
                    flowerCtx,
                    symbols[(i + j + layer) % symbols.length],
                    x, y,
                    `rgb(${red}, ${green}, ${blue})`,
                    10 + layer * 0.45,
                    0.9,
                    layer > 7 ? 6 : 2
                );
            }
        }
    }

    // CENTRO DA ROSA
    for (let i = 0; i < 65; i++) {
        const angle = i * 0.4;
        const radius = i * 0.32;

        drawSymbol(
            flowerCtx,
            ["@", "%", "*", "o"][i % 4],
            c.x + Math.cos(angle) * radius,
            c.y + Math.sin(angle) * radius * 0.8,
            "#ff354b",
            11, 1, 7
        );
    }
}

function buildRose() {
    buildStem();
    buildFlower();
}

// PARTÍCULAS AMBIENTAIS
function createParticles() {
    particles = [];

    for (let i = 0; i < 35; i++) {
        particles.push({
            x: random(0, width),
            y: random(0, height),
            speed: random(0.15, 0.45),
            alpha: random(0.2, 0.7),
            phase: random(0, Math.PI * 2)
        });
    }
}

// BOTÃO DISCRETO NO CENTRO DA ROSA
function createCenterButton() {
    if (document.getElementById("roseCenterButton")) return;

    const style = document.createElement("style");

    style.textContent = `
        #roseCenterButton {
            position: fixed;
            z-index: 5;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            border: 1px solid rgba(255, 190, 200, .42);
            background: radial-gradient(
                circle,
                rgba(255, 95, 120, .30),
                rgba(90, 0, 20, .12) 70%,
                transparent
            );
            color: #ffd5dc;
            font-size: 21px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translate(-50%, -50%) scale(.6);
            transition: opacity 1.2s, transform .5s, visibility 1.2s;
            text-shadow: 0 0 12px #ff617e;
            box-shadow: 0 0 16px rgba(255, 70, 100, .2);
            animation: heartPulse 2.2s infinite ease-in-out;
            -webkit-tap-highlight-color: transparent;
        }

        #roseCenterButton.visible {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }

        #roseCenterButton:hover {
            box-shadow: 0 0 28px rgba(255, 80, 120, .65);
            border-color: rgba(255, 220, 225, .8);
        }

        #roseCenterButton:active {
            transform: translate(-50%, -50%) scale(.8);
        }

        @keyframes heartPulse {
            0%, 100% {
                box-shadow: 0 0 12px rgba(255, 70, 100, .2);
            }
            50% {
                box-shadow: 0 0 25px rgba(255, 70, 100, .55);
            }
        }
    `;

    document.head.appendChild(style);

    const button = document.createElement("button");
    button.id = "roseCenterButton";
    button.type = "button";
    button.innerHTML = "♥";
    button.setAttribute("aria-label", "Abrir sua surpresa");

    document.body.appendChild(button);

    button.addEventListener("click", triggerExplosion);

    positionCenterButton();
}

function positionCenterButton() {
    const button = document.getElementById("roseCenterButton");
    if (!button) return;

    const c = center();

    button.style.left = `${c.x}px`;
    button.style.top = `${c.y}px`;
}

// EXPLOSÃO DE BRILHOS
function createExplosion() {
    explosionStartedAt = performance.now();
    const c = center();

    explosionParticles = [];

    // Partículas pequenas e suaves, em tons de champagne, branco e rosa.
    const colors = [
        "#fff7e9",
        "#f8dfc9",
        "#f4c5ce",
        "#ffffff",
        "#e9b8a9"
    ];

    for (let i = 0; i < 58; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = random(0.8, 3.6);

        explosionParticles.push({
            x: c.x,
            y: c.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: random(1.1, 2.5),
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: random(0.012, 0.019)
        });
    }

    // Alguns pontos próximos ao coração dão profundidade ao brilho.
    for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = random(8, 24);

        explosionParticles.push({
            x: c.x + Math.cos(angle) * distance,
            y: c.y + Math.sin(angle) * distance,
            vx: Math.cos(angle) * random(0.4, 1.5),
            vy: Math.sin(angle) * random(0.4, 1.5),
            size: random(1.3, 2.2),
            color: "#fff4df",
            life: 1,
            decay: random(0.016, 0.024)
        });
    }
}

function drawExplosion() {
    const c = center();

    // Clarão central que aparece e desaparece suavemente.
    const elapsed = performance.now() - explosionStartedAt;
    const flashProgress = Math.min(1, elapsed / 520);

    if (flashProgress < 1) {
        const radius = 12 + flashProgress * 95;
        const alpha = (1 - flashProgress) * 0.42;
        const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);

        glow.addColorStop(0, `rgba(255, 246, 230, ${alpha})`);
        glow.addColorStop(0.35, `rgba(255, 205, 215, ${alpha * 0.55})`);
        glow.addColorStop(1, "rgba(255, 190, 205, 0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dois círculos finos se expandem a partir do centro da rosa.
    for (let ring = 0; ring < 2; ring++) {
        const delay = ring * 190;
        const t = Math.max(0, Math.min(1, (elapsed - delay) / 850));

        if (t <= 0 || t >= 1) continue;

        const eased = 1 - Math.pow(1 - t, 3);
        const radius = 12 + eased * (105 + ring * 28);
        const alpha = (1 - t) * 0.58;

        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 1.4 - t * 0.6;
        ctx.strokeStyle = `rgba(255, 226, 216, ${alpha})`;
        ctx.stroke();
    }

    // Partículas redondas, sem símbolos ou estrelas.
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= p.decay;

        if (p.life <= 0) {
            explosionParticles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.55 + p.life * 0.45), 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

// DESENHAR A ROSA E OS EFEITOS
function drawScene(timestamp) {
    ctx.clearRect(0, 0, width, height);

    const c = center();

    const glow = ctx.createRadialGradient(
        c.x, c.y, 5,
        c.x, c.y, Math.min(width * 0.4, height * 0.3)
    );

    glow.addColorStop(0, "rgba(130, 0, 25, 0.16)");
    glow.addColorStop(0.5, "rgba(70, 0, 15, 0.06)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // CAULE
    const stemProgress = Math.min(1, progress / 0.48);
    const stemHeight = height * 0.35 * stemProgress;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, c.y - 5, width, stemHeight + 10);
    ctx.clip();
    ctx.drawImage(stemCanvas, 0, 0, width, height);
    ctx.restore();

    // FLOR
    const flowerProgress = Math.max(
        0,
        Math.min(1, (progress - 0.32) / 0.68)
    );

    if (flowerProgress > 0) {
        const maxRadius = Math.min(width * 0.34, height * 0.24);
        const opening = 1 - Math.pow(1 - flowerProgress, 2);
        const radius = maxRadius * opening;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
            c.x, c.y,
            radius, radius * 0.85,
            0, 0, Math.PI * 2
        );
        ctx.clip();

        ctx.drawImage(flowerCanvas, 0, 0, width, height);
        ctx.restore();
    }

    // PARTÍCULAS AMBIENTAIS
    for (const p of particles) {
        const flicker = Math.sin(timestamp * 0.002 + p.phase);

        ctx.globalAlpha = p.alpha * (0.65 + flicker * 0.35);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px monospace";
        ctx.fillText("·", p.x, p.y);

        p.y -= p.speed;

        if (p.y < 0) {
            p.y = height;
            p.x = random(0, width);
        }
    }

    ctx.globalAlpha = 1;

    // EXPLOSÃO
    if (explosionParticles.length > 0) {
        drawExplosion();
    }
}

// CLIQUE NO CORAÇÃO
function triggerExplosion() {
    if (progress < 1 || letterOpened || explosionActive) return;

    explosionActive = true;

    const button = document.getElementById("roseCenterButton");

    button.classList.remove("visible");
    button.style.pointerEvents = "none";

    createExplosion();

    // Abre o envelope depois da explosão
    setTimeout(() => {
        openLetter();
        explosionActive = false;
    }, 850);
}

// CRIAR ENVELOPE E CARTA
function createLetterInterface() {
    if (document.getElementById("letterOverlay")) return;

    const style = document.createElement("style");

    style.textContent = `
        #letterOverlay {
            position: fixed;
            inset: 0;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,.82);
            backdrop-filter: blur(8px);
            opacity: 0;
            visibility: hidden;
            transition: opacity .6s, visibility .6s;
            padding: 20px;
        }

        #letterOverlay.visible {
            opacity: 1;
            visibility: visible;
        }

        .envelope-scene {
            position: relative;
            width: min(360px, 88vw);
            height: 245px;
            perspective: 1000px;
            transition: width .8s, height .8s;
        }

        .envelope {
            position: absolute;
            inset: 0;
            background: #651a29;
            border-radius: 5px;
            box-shadow: 0 15px 60px #0009, 0 0 30px #8e142b44;
            cursor: pointer;
            z-index: 2;
        }

        .envelope-flap {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #a33b4e;
            clip-path: polygon(0 0, 100% 0, 50% 58%);
            transform-origin: top;
            transition: transform .8s ease;
            z-index: 5;
        }

        .envelope-heart {
            position: absolute;
            z-index: 6;
            top: 52%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 36px;
            color: #f4d7d7;
            text-shadow: 0 0 15px #ff8c9d;
            transition: opacity .3s;
        }

        .envelope::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(35deg, #521321, #8b2639);
            clip-path: polygon(0 100%, 50% 45%, 100% 100%);
            z-index: 4;
        }

        .letter-paper {
            position: absolute;
            z-index: 1;
            left: 5%;
            top: 5%;
            width: 90%;
            height: 90%;
            overflow-y: auto;
            background-color: #f4ead8;
            background-image:
                linear-gradient(
                    rgba(244, 234, 216, .82),
                    rgba(244, 234, 216, .86)
                ),
                url("./assets/nossa_foto2.jpeg");
            background-position: center;
            background-size: cover;
            color: #49342e;
            border-radius: 3px;
            padding: 28px 24px;
            box-shadow: 0 10px 35px #0008;
            opacity: 0;
            transform: translateY(30px) scale(.92);
            transition:
                transform 1s ease,
                opacity .6s,
                width 1s,
                height 1s,
                left 1s,
                top 1s;
            scrollbar-width: thin;
            scrollbar-color: #b78d80 transparent;
        }

        .letter-paper h2 {
            text-align: center;
            font: normal 25px Georgia, serif;
            margin-bottom: 22px;
            color: #762b3b;
        }

        .letter-paper p {
            font: 16px/1.85 Georgia, serif;
            white-space: pre-line;
            margin-bottom: 17px;
        }

        .letter-paper .final-love {
            text-align: center;
            font: bold 19px Georgia, serif;
            color: #a21d3a;
            margin-top: 25px;
            padding-bottom: 15px;
        }

        .envelope-scene.open .envelope-flap {
            transform: rotateX(180deg);
            z-index: 0;
        }

        .envelope-scene.open .envelope-heart {
            opacity: 0;
        }

        .envelope-scene.open .letter-paper {
            opacity: 1;
            transform: translateY(-35px) scale(1);
            z-index: 8;
        }

        .envelope-scene.expanded {
            width: min(600px, 92vw);
            height: min(76vh, 720px);
        }

        .envelope-scene.expanded .letter-paper {
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            transform: translateY(0) scale(1);
            padding: 35px clamp(20px, 6vw, 55px);
        }

        .letter-close {
            position: absolute;
            z-index: 12;
            top: -15px;
            right: -12px;
            width: 38px;
            height: 38px;
            border: 1px solid #ffffff66;
            border-radius: 50%;
            background: #641626;
            color: white;
            font-size: 22px;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: opacity .4s;
        }

        .envelope-scene.open .letter-close {
            opacity: 1;
            pointer-events: auto;
        }

        @media (max-width: 500px) {
            .envelope-scene.expanded {
                width: 94vw;
                height: 78vh;
            }

            .letter-paper p {
                font-size: 15px;
            }
        }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "letterOverlay";

    overlay.innerHTML = `
        <div class="envelope-scene" id="envelopeScene">
            <div class="letter-paper" id="letterPaper">
                <h2>para você, lorenna ❤️</h2>
                <div id="letterContent"></div>
                <p class="final-love">eu te amo ao infinito e além. ❤️</p>
            </div>

            <div class="envelope" id="envelope">
                <div class="envelope-flap"></div>
                <div class="envelope-heart">♥</div>
            </div>

            <div class="envelope-hint" id="envelopeHint">
                uma cartinha para você
            </div>

            <button class="letter-close" id="letterClose" aria-label="Fechar carta">×</button>
        </div>
    `;

    document.body.appendChild(overlay);
    createFinalSurprise();

    const content = document.getElementById("letterContent");
    const paragraphs = letterText.trim().split(/\n\s*\n/);

    paragraphs.forEach(paragraph => {
        const p = document.createElement("p");
        p.textContent = paragraph.trim();
        content.appendChild(p);
    });

    const envelope = document.getElementById("envelope");
    const scene = document.getElementById("envelopeScene");
    const hint = document.getElementById("envelopeHint");
    const close = document.getElementById("letterClose");

    envelope.addEventListener("click", () => {
        if (scene.classList.contains("open")) return;

        scene.classList.add("open");
        hint.style.display = "none";

        setTimeout(() => {
            scene.classList.add("expanded");
        }, 850);
    });

    close.addEventListener("click", closeLetter);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeLetter();
    });
}

// SURPRESA FINAL
function createFinalSurprise() {
    if (document.getElementById("finalSurpriseOverlay")) return;

    const style = document.createElement("style");
    style.textContent = `
        #finalSurpriseOverlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 22px;
            background:
                radial-gradient(ellipse at 50% 42%, rgba(87, 39, 70, .35), transparent 55%),
                linear-gradient(145deg, #080811, #15101d 55%, #090910);
            color: #fff5ed;
            opacity: 0;
            visibility: hidden;
            transition: opacity 1s ease, visibility 1s ease;
            overflow: hidden;
            font-family: Georgia, serif;
        }
        #finalSurpriseOverlay.visible {
            opacity: 1;
            visibility: visible;
        }
        #finalSurpriseOverlay::before,
        #finalSurpriseOverlay::after {
            content: "";
            position: absolute;
            inset: -30%;
            pointer-events: none;
            background-image:
                radial-gradient(1px 1px at 12% 18%, #fff 98%, transparent),
                radial-gradient(2px 2px at 32% 72%, #f7d9c5 98%, transparent),
                radial-gradient(1px 1px at 74% 24%, #fff 98%, transparent),
                radial-gradient(1px 1px at 86% 68%, #f4c9d4 98%, transparent),
                radial-gradient(2px 2px at 58% 46%, #fff 98%, transparent),
                radial-gradient(1px 1px at 42% 12%, #fff 98%, transparent);
            background-size: 310px 270px;
            opacity: .45;
            animation: finalStarsDrift 28s linear infinite;
        }
        #finalSurpriseOverlay::after {
            opacity: .2;
            transform: scale(1.3);
            animation-duration: 42s;
            animation-direction: reverse;
        }
        @keyframes finalStarsDrift {
            from { transform: translateY(0); }
            to { transform: translateY(80px); }
        }
        .final-surprise-card {
            position: relative;
            z-index: 1;
            width: min(470px, 94vw);
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            padding: clamp(25px, 6vw, 42px);
            border: 1px solid rgba(244, 211, 194, .2);
            border-radius: 22px;
            background: rgba(17, 14, 25, .78);
            box-shadow: 0 25px 90px rgba(0,0,0,.55), 0 0 55px rgba(186, 91, 119, .10);
            backdrop-filter: blur(12px);
        }
        .final-surprise-kicker {
            color: #d8aeb8;
            text-transform: uppercase;
            letter-spacing: .22em;
            font: 10px/1.5 Arial, sans-serif;
            margin-bottom: 18px;
        }
        .final-surprise-card h2 {
            color: #f5dfd5;
            font: normal clamp(27px, 7vw, 36px)/1.2 Georgia, serif;
            margin: 0 0 16px;
        }
        .final-surprise-card p {
            color: #e5d8d9;
            font: 16px/1.8 Georgia, serif;
            margin: 0 auto 24px;
        }
        .final-surprise-action {
            border: 1px solid rgba(244, 205, 196, .55);
            border-radius: 999px;
            padding: 13px 24px;
            color: #fff2eb;
            background: linear-gradient(135deg, #7c3449, #49243c);
            font: 14px Arial, sans-serif;
            letter-spacing: .04em;
            cursor: pointer;
            box-shadow: 0 0 25px rgba(190, 104, 132, .18);
            transition: transform .25s, box-shadow .25s;
        }
        .final-surprise-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 32px rgba(210, 130, 154, .32);
        }
        .final-reveal {
            display: none;
            animation: finalRevealIn 1.2s ease both;
        }
        #finalSurpriseOverlay.revealed .final-teaser { display: none; }
        #finalSurpriseOverlay.revealed .final-reveal { display: block; }
        .final-surprise-photo {
            display: block;
            width: 100%;
            max-height: 43vh;
            object-fit: cover;
            object-position: center 35%;
            border-radius: 13px;
            margin: 0 auto 23px;
            border: 1px solid rgba(255,255,255,.18);
            box-shadow: 0 12px 40px rgba(0,0,0,.4);
        }
        .final-reveal h2 { margin-bottom: 12px; }
        .final-reveal .infinity-line {
            color: #f1c7cf;
            font-size: 19px;
            margin-bottom: 0;
        }
        .final-surprise-close {
            position: absolute;
            z-index: 5;
            top: 14px;
            right: 16px;
            width: 38px;
            height: 38px;
            border: 1px solid rgba(255,255,255,.28);
            border-radius: 50%;
            color: #fff2eb;
            background: rgba(255,255,255,.08);
            font: 24px/1 Arial, sans-serif;
            cursor: pointer;
            display: grid;
            place-items: center;
            transition: background .25s, transform .25s;
        }
        .final-surprise-close:hover {
            background: rgba(255,255,255,.18);
            transform: rotate(90deg);
        }
        #endingHeartOverlay {
            position: fixed;
            inset: 0;
            z-index: 10002;
            overflow: hidden;
            display: grid;
            place-items: center;
            background: #000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 1.5s ease, visibility 1.5s ease;
        }
        #endingHeartOverlay.visible {
            opacity: 1;
            visibility: visible;
        }
        #endingHeartCanvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
        }
        .ending-heart-caption {
            position: absolute;
            z-index: 1;
            bottom: 12%;
            width: 100%;
            padding: 0 20px;
            color: #f4dce5;
            text-align: center;
            font: clamp(15px, 3vw, 20px)/1.5 Georgia, serif;
            letter-spacing: .08em;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 1.8s ease, transform 1.8s ease;
            text-shadow: 0 0 18px rgba(255,220,240,.65);
        }
        #endingHeartOverlay.finished .ending-heart-caption {
            opacity: 1;
            transform: translateY(0);
        }
        @keyframes finalRevealIn {
            from { opacity: 0; transform: translateY(16px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 480px) {
            .final-surprise-card { padding: 25px 20px; }
            .final-surprise-card p { font-size: 15px; }
            .final-surprise-photo { max-height: 39vh; }
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("section");
    overlay.id = "finalSurpriseOverlay";
    overlay.setAttribute("aria-label", "Surpresa final");
    overlay.innerHTML = `
        <button class="final-surprise-close" id="closeFinalSurprise" type="button" aria-label="Fechar surpresa">×</button>
        <div class="final-surprise-card">
            <div class="final-teaser">
                <div class="final-surprise-kicker">só mais uma coisinha...</div>
                <h2>Você sabe até onde eu te amo?</h2>
                <p>Ainda não acabou, Lorenna. Guardei uma última surpresa pra você.</p>
                <button class="final-surprise-action" id="revealFinalSurprise" type="button">Descobrir ❤️</button>
            </div>
            <div class="final-reveal">
                <img class="final-surprise-photo" src="assets/nossa_foto3.jpeg" alt="Uma foto especial de nós dois">
                <div class="final-surprise-kicker">em todos os caminhos</div>
                <h2>Eu escolheria você.</h2>
                <p>Se eu pudesse escolher novamente, entre todos os caminhos, em todas as vidas e em todos os universos, ainda escolheria você.</p>
                <p class="infinity-line">Eu te amo ao infinito e além, Lorenna. ❤️</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("revealFinalSurprise").addEventListener("click", () => {
        overlay.classList.add("revealed");
    });

    const ending = document.createElement("div");
    ending.id = "endingHeartOverlay";
    ending.innerHTML = `
        <canvas id="endingHeartCanvas"></canvas>
        <div class="ending-heart-caption">eu te amo ao infinito e além. ❤️</div>
    `;
    document.body.appendChild(ending);

    document.getElementById("closeFinalSurprise").addEventListener("click", closeFinalSurprise);
}

function closeFinalSurprise() {
    const overlay = document.getElementById("finalSurpriseOverlay");
    const ending = document.getElementById("endingHeartOverlay");

    if (!overlay || !ending) return;

    // A surpresa some e a tela fica preta antes de as estrelas aparecerem.
    overlay.classList.remove("visible");
    overlay.style.pointerEvents = "none";

    setTimeout(() => {
        ending.classList.add("visible");
        startEndingHeartAnimation();
    }, 450);
}

function startEndingHeartAnimation() {
    const canvas = document.getElementById("endingHeartCanvas");
    const overlay = document.getElementById("endingHeartOverlay");
    if (!canvas || !overlay) return;

    const context = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    function resizeEndingCanvas() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeEndingCanvas();

    const starCount = 150;
    const stars = [];
    const scale = Math.min(w / 39, h / 36) * 0.88;
    const centerX = w / 2;
    const centerY = h * 0.47;

    // Pontos distribuídos ao longo da curva matemática de um coração.
    for (let i = 0; i < starCount; i++) {
        const t = (Math.PI * 2 * i) / starCount;
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            startX: Math.random() * w,
            startY: Math.random() * h,
            targetX: centerX + heartX * scale,
            targetY: centerY - heartY * scale,
            size: random(0.7, 2.1),
            phase: random(0, Math.PI * 2),
            speed: random(1.2, 3.8),
            delay: random(0, 650)
        });
    }

    const startedAt = performance.now();
    const duration = 3000;

    function draw(now) {
        const elapsed = now - startedAt;
        context.clearRect(0, 0, w, h);

        const backgroundGlow = context.createRadialGradient(
            centerX, centerY, 0, centerX, centerY, Math.min(w, h) * 0.48
        );
        backgroundGlow.addColorStop(0, "rgba(35, 20, 42, .22)");
        backgroundGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = backgroundGlow;
        context.fillRect(0, 0, w, h);

        let allArrived = true;

        for (const star of stars) {
            const localProgress = Math.max(0, Math.min(1,
                (elapsed - star.delay) / duration
            ));
            const eased = 1 - Math.pow(1 - localProgress, 3);

            star.x = star.startX + (star.targetX - star.startX) * eased;
            star.y = star.startY + (star.targetY - star.startY) * eased;

            if (localProgress < 1) allArrived = false;

            const twinkle = 0.62 + Math.sin(now * 0.003 * star.speed + star.phase) * 0.32;
            const alpha = Math.min(1, localProgress * 1.8) * twinkle;

            context.globalAlpha = alpha;
            context.fillStyle = "#fff4f8";
            context.shadowColor = "#f5c7df";
            context.shadowBlur = 5 + star.size * 4;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = 1;
        context.shadowBlur = 0;

        if (allArrived && !overlay.classList.contains("finished")) {
            overlay.classList.add("finished");
        }

        if (elapsed < duration + 800) {
            requestAnimationFrame(draw);
        }
    }

    requestAnimationFrame(draw);
    window.addEventListener("resize", resizeEndingCanvas, { once: true });
}

function showFinalSurprise() {
    const overlay = document.getElementById("finalSurpriseOverlay");
    if (!overlay || finalSurpriseShown) return;
    finalSurpriseShown = true;
    overlay.classList.add("visible");
}

// ABRIR ENVELOPE
function openLetter() {
    const overlay = document.getElementById("letterOverlay");
    if (!overlay) return;

    letterOpened = true;
    overlay.classList.add("visible");
}

// FECHAR CARTA
function closeLetter() {
    const overlay = document.getElementById("letterOverlay");
    const scene = document.getElementById("envelopeScene");

    if (!overlay || !scene) return;

    scene.classList.remove("expanded");
    scene.classList.remove("open");

    setTimeout(() => {
        overlay.classList.remove("visible");
        letterOpened = false;

        const button = document.getElementById("roseCenterButton");

        if (button && progress >= 1) {
            button.style.pointerEvents = "auto";
            button.classList.add("visible");
        }

        setTimeout(showFinalSurprise, 650);
    }, 500);
}

// LOOP DA ANIMAÇÃO
function animate(timestamp) {
    if (!started) return;

    requestAnimationFrame(animate);

    if (timestamp - lastFrame < FRAME_INTERVAL) return;

    lastFrame = timestamp;

    if (progress < 1) {
        progress = Math.min(1, progress + 0.0025);
    }

    drawScene(timestamp);

    if (progress >= 1 && !message.classList.contains("shown")) {
        message.classList.remove("hidden");
        message.classList.add("shown");

        const button = document.getElementById("roseCenterButton");

        if (button) {
            button.classList.add("visible");
        }
    }
}

// INICIAR EXPERIÊNCIA
startButton.addEventListener("click", async () => {
    if (started) return;

    started = true;

    intro.style.opacity = "0";
    music.volume = 0.65;

    try {
        await music.play();
    } catch (error) {
        console.log("Erro ao iniciar música:", error);
    }

    setTimeout(() => {
        intro.classList.add("hidden");
        experience.classList.remove("hidden");
        musicButton.classList.remove("hidden");

        resizeCanvas();
        createParticles();
        buildRose();

        createCenterButton();
        createLetterInterface();

        requestAnimationFrame(animate);
    }, 1200);
});

// CONTROLE DA MÚSICA
musicButton.addEventListener("click", async () => {
    if (music.paused) {
        try {
            await music.play();
            musicButton.textContent = "♫";
            musicButton.setAttribute("aria-label", "Pausar música");
        } catch (error) {
            console.log(error);
        }
    } else {
        music.pause();
        musicButton.textContent = "▶";
        musicButton.setAttribute("aria-label", "Reproduzir música");
    }
});