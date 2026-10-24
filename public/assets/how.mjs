// How grove works (G-08 FR-804): the scene with Replay; the terms are static text in how.html.
import { playGrow } from './grow.mjs';

const host = document.getElementById('grow-host');
const replay = document.getElementById('replay');
const play = () => { replay.disabled = true; playGrow(host, { onend: () => { replay.disabled = false; }, skipLabel: 'Stop' }); };
replay.addEventListener('click', play);
play();
