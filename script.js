(() => {
const card = document.getElementById("IS24005");

if (!card) {
return;
}

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const maxTilt = 1.8;
let frame = 0;

const state = {
currentX: 0,
currentY: 0,
currentLight: 0,
currentSpotX: 50,
currentSpotY: 50,
targetX: 0,
targetY: 0,
targetLight: 0,
targetSpotX: 50,
targetSpotY: 50
};

const enabled = () => finePointer.matches && !reducedMotion.matches;

const writeState = () => {
card.style.setProperty("--tilt-x", `${state.currentX.toFixed(3)}deg`);
card.style.setProperty("--tilt-y", `${state.currentY.toFixed(3)}deg`);
card.style.setProperty("--spotlight-opacity", state.currentLight.toFixed(3));
card.style.setProperty("--spotlight-x", `${state.currentSpotX.toFixed(2)}%`);
card.style.setProperty("--spotlight-y", `${state.currentSpotY.toFixed(2)}%`);
};

const settled = () => (
Math.abs(state.currentX - state.targetX) < 0.003 &&
Math.abs(state.currentY - state.targetY) < 0.003 &&
Math.abs(state.currentLight - state.targetLight) < 0.003 &&
Math.abs(state.currentSpotX - state.targetSpotX) < 0.04 &&
Math.abs(state.currentSpotY - state.targetSpotY) < 0.04
);

const animate = () => {
state.currentX += (state.targetX - state.currentX) * 0.09;
state.currentY += (state.targetY - state.currentY) * 0.09;
state.currentLight += (state.targetLight - state.currentLight) * 0.11;
state.currentSpotX += (state.targetSpotX - state.currentSpotX) * 0.16;
state.currentSpotY += (state.targetSpotY - state.currentSpotY) * 0.16;

writeState();

if (settled()) {
state.currentX = state.targetX;
state.currentY = state.targetY;
state.currentLight = state.targetLight;
state.currentSpotX = state.targetSpotX;
state.currentSpotY = state.targetSpotY;
writeState();
frame = 0;
return;
}

frame = window.requestAnimationFrame(animate);
};

const start = () => {
if (!frame) {
frame = window.requestAnimationFrame(animate);
}
};

const watchMedia = (mediaQuery, handler) => {
if (typeof mediaQuery.addEventListener === "function") {
mediaQuery.addEventListener("change", handler);
return;
}

mediaQuery.addListener(handler);
};

const reset = () => {
state.targetX = 0;
state.targetY = 0;
state.targetLight = 0;
state.targetSpotX = 50;
state.targetSpotY = 50;
card.classList.remove("is-pointer-active");

if (!enabled()) {
if (frame) {
window.cancelAnimationFrame(frame);
frame = 0;
}
state.currentX = state.targetX;
state.currentY = state.targetY;
state.currentLight = state.targetLight;
state.currentSpotX = state.targetSpotX;
state.currentSpotY = state.targetSpotY;
writeState();
return;
}

start();
};

const syncMotionClass = () => {
card.classList.toggle("is-motion-ready", !reducedMotion.matches);
};

card.addEventListener("pointermove", (event) => {
if (!enabled() || event.pointerType === "touch") {
return;
}

const rect = card.getBoundingClientRect();
const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

state.targetY = (x - 0.5) * maxTilt * 2;
state.targetX = (0.5 - y) * maxTilt * 2;
state.targetLight = 0.72;
state.targetSpotX = Math.min(100, Math.max(0, x * 100));
state.targetSpotY = Math.min(100, Math.max(0, y * 100));

card.classList.add("is-pointer-active");
start();
});

card.addEventListener("pointerleave", reset);
syncMotionClass();
watchMedia(finePointer, reset);
watchMedia(reducedMotion, () => {
syncMotionClass();
reset();
});

if (reducedMotion.matches) {
writeState();
}
})();
