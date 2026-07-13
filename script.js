document.addEventListener('DOMContentLoaded', () => {
	// Navigate to redesigned portfolio when clicking profile picture
	const profileContainer = document.querySelector('.profile-video-container');
	profileContainer?.addEventListener('click', () => {
		window.location.href = './redesign/';
	});

	const playerRoot = document.getElementById('mediaPlayer');
	if (!playerRoot) return;

	const audio = document.getElementById('audioEl');
	const playBtn = document.getElementById('playBtn');
	const progressContainer = document.getElementById('progressContainer');
	const progressFill = document.getElementById('progressFill');
	const timeText = document.getElementById('timeText');
	const titleText = document.getElementById('titleText');
	const artistText = document.getElementById('artistText');

	artistText.textContent = 'Artist';

	const playlist = [
		{ url: 'audio1.mp3', title: 'NORTHERNLIGHT', artist: 'Toby Fox' },
		{ url: 'audio2.mp3', title: 'The Second Sanctuary', artist: 'Toby Fox' },
		{ url: 'audio3.mp3', title: 'The Third Sanctuary', artist: 'Toby Fox' },
		{ url: 'audio4.mp3', title: 'Neverending Night', artist: 'Toby Fox' },
		{ url: 'audio5.mp3', title: 'With Hope Crossed On Our Hearts', artist: 'Toby Fox' }
	];

	let currentIndex = -1;
	let rafId = null;

	function chooseRandomIndex(excludeIndex) {
		if (playlist.length <= 1) return 0;
		let idx = excludeIndex;
		while (idx === excludeIndex) {
			idx = Math.floor(Math.random() * playlist.length);
		}
		return idx;
	}

	function loadTrack(index) {
		currentIndex = index;
		const track = playlist[index];
		audio.src = track.url;
		titleText.textContent = track.title;
		artistText.textContent = track.artist;
		resetProgress();
	}

	function resetProgress() {
		progressFill.style.width = '0%';
		timeText.textContent = '00:00';
	}

	function formatTime(seconds) {
		if (!isFinite(seconds)) return '00:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	function updateWhilePlaying() {
		const duration = audio.duration || 0;
		const current = audio.currentTime || 0;
		const ratio = duration > 0 ? Math.min(current / duration, 1) : 0;
		progressFill.style.width = `${ratio * 100}%`;
		timeText.textContent = formatTime(current);
		rafId = requestAnimationFrame(updateWhilePlaying);
	}

	function startUpdating() {
		stopUpdating();
		rafId = requestAnimationFrame(updateWhilePlaying);
	}

	function stopUpdating() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function play() {
		audio.play().then(() => {
			playerRoot.classList.add('playing');
			startUpdating();
		}).catch(() => {
		});
	}

	function pause() {
		audio.pause();
		playerRoot.classList.remove('playing');
		stopUpdating();
	}

	function togglePlay() {
		if (audio.paused) play(); else pause();
	}

	function seekByClientX(clientX) {
		const rect = progressContainer.getBoundingClientRect();
		const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
		const ratio = rect.width > 0 ? x / rect.width : 0;
		if (isFinite(audio.duration) && audio.duration > 0) {
			audio.currentTime = ratio * audio.duration;
		}
	}

	
	playBtn.addEventListener('click', togglePlay);

	progressContainer.addEventListener('click', (e) => {
		seekByClientX(e.clientX);
	});

	let isPointerDown = false;
	progressContainer.addEventListener('pointerdown', (e) => {
		isPointerDown = true;
		seekByClientX(e.clientX);
	});
	window.addEventListener('pointermove', (e) => {
		if (!isPointerDown) return;
		seekByClientX(e.clientX);
	});
	window.addEventListener('pointerup', () => { isPointerDown = false; });

	audio.addEventListener('play', () => {
		playerRoot.classList.add('playing');
		startUpdating();
	});
	audio.addEventListener('pause', () => {
		playerRoot.classList.remove('playing');
		stopUpdating();
	});
	audio.addEventListener('ended', () => {
		const next = chooseRandomIndex(currentIndex);
		loadTrack(next);
		play();
	});
		audio.addEventListener('loadedmetadata', () => {
			resetProgress();
		});

	loadTrack(chooseRandomIndex(-1));

	playerRoot.style.position = 'absolute';

	const scrollPrompt = document.getElementById('scrollPrompt');
	if (scrollPrompt) {
		let hidden = false;
		function hidePrompt() {
			if (hidden) return; hidden = true;
			scrollPrompt.classList.add('hidden');
		}
		window.addEventListener('scroll', () => {
			if (window.scrollY > 120) hidePrompt();
		}, { passive: true });
		['click','keydown','touchstart','pointerdown','wheel'].forEach(evt => {
			window.addEventListener(evt, hidePrompt, { once: true, passive: true });
		});
	}

});


