/**
 * Minimal Solvara Prime Star System - Rocket Navigation Only
 */

document.addEventListener('DOMContentLoaded', function() {
  // Audio player controls
  const playBtn = document.getElementById('play-btn');
  const audioPlayer = document.getElementById('audio-player');

  if (playBtn && audioPlayer) {
    let isPlaying = false;

    playBtn.addEventListener('click', function() {
      if (isPlaying) {
        audioPlayer.pause();
        playBtn.innerHTML = '▶ LISTEN';
        playBtn.classList.remove('playing');
        isPlaying = false;
      } else {
        audioPlayer.play();
        playBtn.innerHTML = '⏸ PAUSE';
        playBtn.classList.add('playing');
        isPlaying = true;
      }
    });

    // Reset button when audio ends
    audioPlayer.addEventListener('ended', function() {
      playBtn.innerHTML = '▶ LISTEN';
      playBtn.classList.remove('playing');
      isPlaying = false;
    });
  }

  // Hero audio player controls
  const heroPlayBtn = document.getElementById('hero-play-btn');
  const heroAudio = document.getElementById('hero-audio');

  if (heroPlayBtn && heroAudio) {
    let isHeroPlaying = false;

    heroPlayBtn.addEventListener('click', function() {
      if (isHeroPlaying) {
        heroAudio.pause();
        heroPlayBtn.innerHTML = '▶ LISTEN';
        isHeroPlaying = false;
      } else {
        // Stop radio audio if it's playing
        const radioAudio = document.getElementById('radio-audio');
        const radioPlayBtn = document.getElementById('radio-play');
        if (radioAudio && !radioAudio.paused) {
          radioAudio.pause();
          if (radioPlayBtn) {
            radioPlayBtn.innerHTML = '▶ PLAY';
            radioPlayBtn.classList.remove('playing');
          }
        }

        heroAudio.play();
        heroPlayBtn.innerHTML = '⏸ PAUSE';
        isHeroPlaying = true;
      }
    });

    // Reset button when audio ends
    heroAudio.addEventListener('ended', function() {
      heroPlayBtn.innerHTML = '▶ LISTEN';
      isHeroPlaying = false;
    });
  }
  
  // Simple word flickering animation
  const flickerText = document.querySelector('.flicker-text');
  if (flickerText) {
    let currentWord = 'MY';
    
    setInterval(() => {
      // Add glitch effect
      flickerText.classList.add('glitching');
      
      // Switch word after glitch starts
      setTimeout(() => {
        currentWord = currentWord === 'MY' ? 'OUR' : 'MY';
        flickerText.textContent = currentWord;
        
        // Remove glitch effect
        setTimeout(() => {
          flickerText.classList.remove('glitching');
        }, 300);
      }, 150);
    }, 4000); // Switch every 4 seconds
  }
  
  // Cache DOM elements
  const player = document.getElementById('player');
  const coordX = document.getElementById('coord-x');
  const coordY = document.getElementById('coord-y');
  
  // Game state variables
  let playerX = 50; // Screen percentage (X: 0)
  let playerY = 85.5; // Screen percentage (Y: 71)
  let keysPressed = {};
  let animationFrameId = null;
  let currentRocketRotation = 0;
  
  // Constants
  const MOVEMENT_SPEED = 2.0;
  const MOVEMENT_KEYS = ['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  
  // Coordinate conversion utilities
  const coordUtils = {
    screenToGameX: (screenX) => Math.floor((screenX - 50) * 2),
    screenToGameY: (screenY) => Math.floor((50 - screenY) * 2)
  };
  
  // Movement handlers
  const setupMovementHandlers = () => {
    document.addEventListener('keydown', (e) => {
      // Check if user is typing in a form field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
      );
      
      // Don't move rocket if user is typing
      if (isTyping) {
        return;
      }
      
      // Prevent default scrolling behavior for arrow keys
      if (MOVEMENT_KEYS.includes(e.key)) {
        e.preventDefault();
      }
      
      keysPressed[e.key] = true;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(moveRocket);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      delete keysPressed[e.key];
      const anyMovementKeyPressed = MOVEMENT_KEYS.some(key => keysPressed[key]);
      if (!anyMovementKeyPressed && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    });
  };
  
  // Main animation function
  function moveRocket() {
    let rotationDegree = null;
    let isMoving = false;
    
    // Process key inputs
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
      playerY = playerY + MOVEMENT_SPEED;
      rotationDegree = 0;
      isMoving = true;
      
      // Check if rocket hits top of screen - trigger scroll up
      if (playerY > 98) {
        playerY = 98;
        // Scroll up by a small amount
        window.scrollBy({
          top: -5,
          behavior: 'instant'
        });
      } else {
        playerY = Math.min(98, playerY);
      }
    }
    
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
      playerY = playerY - MOVEMENT_SPEED;
      rotationDegree = 180;
      isMoving = true;
      
      // Check if rocket hits bottom of screen - trigger scroll down
      if (playerY < 2) {
        playerY = 2;
        // Scroll down by a small amount
        window.scrollBy({
          top: 5,
          behavior: 'instant'
        });
      } else {
        playerY = Math.max(2, playerY);
      }
    }
    
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
      playerX = Math.max(5, playerX - MOVEMENT_SPEED);
      rotationDegree = 270;
      isMoving = true;
    }
    
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
      playerX = Math.min(95, playerX + MOVEMENT_SPEED);
      rotationDegree = 90;
      isMoving = true;
    }
    
    // Update position if moving
    if (isMoving) {
      // Only update rotation if it changed
      if (rotationDegree !== null && rotationDegree !== currentRocketRotation) {
        currentRocketRotation = rotationDegree;
      }
      
      // Update rocket position and rotation
      player.style.cssText = `
        position: fixed;
        left: ${playerX}%;
        bottom: ${playerY}%;
        transform: translate(-50%, 50%) rotate(${currentRocketRotation}deg);
        z-index: 9999;
      `;
      
      // Update coordinate displays
      const gridX = coordUtils.screenToGameX(playerX);
      const gridY = coordUtils.screenToGameY(playerY);
      coordX.textContent = `X: ${gridX}`;
      coordY.textContent = `Y: ${gridY}`;
    }
    
    // Continue animation loop
    animationFrameId = requestAnimationFrame(moveRocket);
  }
  
  // Set initial player position
  function setInitialPlayerPosition() {
    playerX = 50; // Center horizontally (X: 0)
    playerY = 85.5; // Upper position (Y: 71)
    
    player.style.cssText = `
      position: fixed;
      left: ${playerX}%;
      bottom: ${playerY}%;
      transform: translate(-50%, 50%) rotate(0deg);
      z-index: 9999;
    `;
    
    const gridX = coordUtils.screenToGameX(playerX);
    const gridY = coordUtils.screenToGameY(playerY);
    if (coordX) coordX.textContent = `X: ${gridX}`;
    if (coordY) coordY.textContent = `Y: ${gridY}`;
    
    currentRocketRotation = 0;
  }
  
  // Initialize
  function init() {
    setupMovementHandlers();
    setInitialPlayerPosition();
  }
  
  // Start
  init();
  
  // Newsletter popup functionality
  const newsletterBtn = document.getElementById('newsletter-btn');
  const newsletterPopup = document.getElementById('newsletter-popup');
  const closePopupBtn = document.getElementById('close-popup');
  
  if (newsletterBtn && newsletterPopup) {
    newsletterBtn.addEventListener('click', () => {
      newsletterPopup.style.display = 'flex';
    });
    
    closePopupBtn.addEventListener('click', () => {
      newsletterPopup.style.display = 'none';
    });
    
    // Close popup when clicking outside
    newsletterPopup.addEventListener('click', (e) => {
      if (e.target === newsletterPopup) {
        newsletterPopup.style.display = 'none';
      }
    });
  }
  
  // Mission Control Timer
  const missionTimer = document.getElementById('mission-time');
  if (missionTimer) {
    let seconds = 0;
    setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      missionTimer.textContent = `T+ ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }
  
  // Visual Feed Gallery
  const feedImages = [
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770574099/IMG_5575_6_arzztq.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770573877/IMG_5582_hcga6e.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770574456/IMG_3875_pdtaio.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770574457/IMG_3930_uwonh6.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770573227/IMG_5579_2_mvrkfo.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770573226/IMG_5578_2_h7hct6.jpg',
    'https://res.cloudinary.com/duynyjs6q/image/upload/v1770574748/IMG_5567_2_xjm8fp.jpg'
  ];
  
  const fallbackImage = './Downloads/seth-portrait.jpg';
  let currentFeedIndex = 0;
  
  const feedImage = document.getElementById('feed-image');
  const feedCounter = document.getElementById('feed-counter');
  const prevFeedBtn = document.getElementById('prev-feed');
  const nextFeedBtn = document.getElementById('next-feed');
  
  function updateFeedCounter() {
    if (feedCounter) {
      feedCounter.textContent = `${String(currentFeedIndex + 1).padStart(2, '0')} / ${String(feedImages.length).padStart(2, '0')}`;
    }
  }
  
  function changeFeedImage(newIndex) {
    if (feedImage) {
      currentFeedIndex = newIndex;
      feedImage.style.opacity = '0';
      setTimeout(() => {
        const newSrc = feedImages[currentFeedIndex];
        const testImg = new Image();
        testImg.onload = function() {
          feedImage.src = newSrc;
          feedImage.style.opacity = '1';
        };
        testImg.onerror = function() {
          feedImage.src = fallbackImage;
          feedImage.style.opacity = '1';
        };
        testImg.src = newSrc;
      }, 300);
      updateFeedCounter();
    }
  }
  
  // Feed navigation
  if (prevFeedBtn) {
    prevFeedBtn.addEventListener('click', () => {
      const newIndex = currentFeedIndex === 0 ? feedImages.length - 1 : currentFeedIndex - 1;
      changeFeedImage(newIndex);
      clearInterval(feedAutoAdvance);
      feedAutoAdvance = setInterval(() => {
        changeFeedImage((currentFeedIndex + 1) % feedImages.length);
      }, 6000);
    });
  }
  
  if (nextFeedBtn) {
    nextFeedBtn.addEventListener('click', () => {
      const newIndex = (currentFeedIndex + 1) % feedImages.length;
      changeFeedImage(newIndex);
      clearInterval(feedAutoAdvance);
      feedAutoAdvance = setInterval(() => {
        changeFeedImage((currentFeedIndex + 1) % feedImages.length);
      }, 6000);
    });
  }
  
  // Auto-advance feed
  let feedAutoAdvance = null;
  if (feedImage && feedImages.length > 1) {
    feedAutoAdvance = setInterval(() => {
      changeFeedImage((currentFeedIndex + 1) % feedImages.length);
    }, 6000);
  }
  
  // Initialize feed counter
  updateFeedCounter();
  
  // Radio Tuner Functionality
  const frequencyDial = document.getElementById('frequency-dial');
  const frequencyDisplay = document.getElementById('frequency-display');
  const stationName = document.getElementById('station-name');
  const tunerNeedle = document.getElementById('tuner-needle');
  const radioPlayBtn = document.getElementById('radio-play');
  const radioAudio = document.getElementById('radio-audio');
  const volumeControl = document.getElementById('volume');
  const stationItems = document.querySelectorAll('.station-item');
  const signalBars = document.querySelectorAll('.signal-bar');
  
  const stations = [
    { freq: '88.9', name: 'THE BED\'S TOO BIG', src: 'https://res.cloudinary.com/duynyjs6q/video/upload/v1757220300/01_The_Bed_s_Too_Big_Without_You_h8bssq.m4a', signal: 3 },
    { freq: '94.3', name: 'GOING SOMEWHERE', src: 'https://res.cloudinary.com/duynyjs6q/video/upload/v1760755611/Going_Somewhere_FINAL_MASTER_l2vw4u.wav', signal: 4 },
    { freq: '99.7', name: 'F.I.N.E.', src: 'https://res.cloudinary.com/duynyjs6q/video/upload/v1760755949/F.I.N.E._Clean_lehqff.wav', signal: 4 },
    { freq: '103.3', name: 'REST IN PIECES', src: 'https://res.cloudinary.com/duynyjs6q/video/upload/v1760756458/Rest-In-Pieces_p5fxl9.wav', signal: 4 },
    { freq: '106.0', name: 'I\'LL BE THERE', src: 'https://res.cloudinary.com/duynyjs6q/video/upload/v1760756807/I_ll_Be_There_AAyan_EQd_wmc3d2.wav', signal: 4 }
  ];
  
  // Update radio display when tuning
  if (frequencyDial) {
    frequencyDial.addEventListener('input', function() {
      const stationIndex = parseInt(this.value);
      const station = stations[stationIndex];
      
      // Update frequency display
      frequencyDisplay.textContent = station.freq;
      
      // Update station name
      stationName.textContent = station.name;
      
      // Move tuner needle
      const needlePosition = 10 + (stationIndex * 20);
      tunerNeedle.style.left = needlePosition + '%';
      
      // Update signal strength bars
      signalBars.forEach((bar, index) => {
        if (index < station.signal) {
          bar.classList.add('active');
        } else {
          bar.classList.remove('active');
        }
      });
      
      // Update station list active state
      stationItems.forEach((item, index) => {
        if (index === stationIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Stop current audio and update source if playing
      if (radioAudio && !radioAudio.paused) {
        radioAudio.pause();
      }

      // Update audio source and auto-play if station has signal
      if (station.src && radioAudio) {
        // Stop hero audio if it's playing
        const heroAudio = document.getElementById('hero-audio');
        const heroPlayBtn = document.getElementById('hero-play-btn');
        if (heroAudio && !heroAudio.paused) {
          heroAudio.pause();
          if (heroPlayBtn) {
            heroPlayBtn.innerHTML = '▶ LISTEN';
          }
        }

        radioAudio.src = station.src;
        // Auto-play the new station
        radioAudio.play();
        radioPlayBtn.innerHTML = '⏸ PAUSE';
        radioPlayBtn.classList.add('playing');
      } else {
        // No signal - stop playing
        if (radioAudio) {
          radioAudio.pause();
          radioPlayBtn.innerHTML = '▶ PLAY';
          radioPlayBtn.classList.remove('playing');
        }
      }
    });
  }
  
  // Station list click handling
  stationItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      frequencyDial.value = index;
      frequencyDial.dispatchEvent(new Event('input'));
    });
  });
  
  // Radio play button
  if (radioPlayBtn && radioAudio) {
    radioPlayBtn.addEventListener('click', function() {
      const stationIndex = parseInt(frequencyDial.value);
      const station = stations[stationIndex];
      
      if (!station.src) {
        // Show static/no signal effect
        stationName.textContent = 'NO SIGNAL';
        setTimeout(() => {
          stationName.textContent = station.name;
        }, 1000);
        return;
      }
      
      if (radioAudio.paused) {
        // Stop hero audio if it's playing
        const heroAudio = document.getElementById('hero-audio');
        const heroPlayBtn = document.getElementById('hero-play-btn');
        if (heroAudio && !heroAudio.paused) {
          heroAudio.pause();
          if (heroPlayBtn) {
            heroPlayBtn.innerHTML = '▶ LISTEN';
          }
        }

        radioAudio.play();
        this.innerHTML = '⏸ PAUSE';
        this.classList.add('playing');
      } else {
        radioAudio.pause();
        this.innerHTML = '▶ PLAY';
        this.classList.remove('playing');
      }
    });
    
    radioAudio.addEventListener('ended', function() {
      radioPlayBtn.innerHTML = '▶ PLAY';
      radioPlayBtn.classList.remove('playing');
    });
  }
  
  // Volume control
  if (volumeControl && radioAudio) {
    volumeControl.addEventListener('input', function() {
      radioAudio.volume = this.value / 100;
    });
    // Set initial volume
    radioAudio.volume = 0.7;
  }
  
  // CTA buttons (you can update these with actual links later)
  const listenEverywhereBtn = document.querySelector('.listen-everywhere-btn');
  const earlyAccessBtn = document.querySelector('.early-access-btn');
  
  if (listenEverywhereBtn) {
    listenEverywhereBtn.addEventListener('click', function() {
      // Add your streaming platform link here
      window.open('https://linktr.ee/sethpower', '_blank'); // Placeholder
    });
  }
  
  if (earlyAccessBtn) {
    earlyAccessBtn.addEventListener('click', function() {
      // Open newsletter signup
      const newsletterPopup = document.getElementById('newsletter-popup');
      if (newsletterPopup) {
        newsletterPopup.style.display = 'flex';
      }
    });
  }
  
  // Navigation instructions close button
  const navClose = document.getElementById('nav-close');
  const navInstructions = document.getElementById('nav-instructions');

  if (navClose && navInstructions) {
    navClose.addEventListener('click', function() {
      navInstructions.style.display = 'none';
    });
  }

  // Mission/Bio panel navigation
  const bioPanel1 = document.getElementById('bio-panel-1');
  const bioPanel2 = document.getElementById('bio-panel-2');
  const missionNext = document.getElementById('mission-next');
  const missionPrev2 = document.getElementById('mission-prev-2');
  const newsletterBtnBio1 = document.querySelector('.newsletter-btn-bio1');
  const newsletterBtn2 = bioPanel2 ? bioPanel2.querySelector('.receive-transmissions-btn') : null;

  // Function to update signal/clarity bars
  function updateStatusBars(panel) {
    const signalBar = document.querySelector('.feed-status .status-row:first-child .status-fill');
    const clarityBar = document.querySelector('.feed-status .status-row:last-child .status-fill');

    if (signalBar && clarityBar) {
      // First remove any existing animations but keep current width
      signalBar.style.animation = 'none';
      clarityBar.style.animation = 'none';

      // Force reflow to ensure transition works
      void signalBar.offsetWidth;
      void clarityBar.offsetWidth;

      // Set transition for smooth animation
      signalBar.style.transition = 'width 1.5s ease-in-out, background 1.5s ease-in-out';
      clarityBar.style.transition = 'width 1.5s ease-in-out, background 1.5s ease-in-out';

      // Small delay to ensure transition is applied
      setTimeout(() => {
        if (panel === 1) {
          // Panel 1: High signal (95%), very low clarity (15%) - mysterious, distant
          signalBar.style.width = '95%';
          clarityBar.style.width = '15%';
          signalBar.style.background = 'linear-gradient(90deg, #89CFC0, rgba(137, 207, 192, 0.8))';
          clarityBar.style.background = 'linear-gradient(90deg, rgba(137, 207, 192, 0.3), rgba(137, 207, 192, 0.2))';

          // After transition completes, add subtle fluctuation
          setTimeout(() => {
            signalBar.style.animation = 'signal-fluctuate-high 3s ease-in-out infinite';
            clarityBar.style.animation = 'clarity-fluctuate-low 4s ease-in-out infinite';
          }, 1600);

        } else if (panel === 2) {
          // Panel 2: Lower signal (45%), very high clarity (95%) - grounded, real
          signalBar.style.width = '45%';
          clarityBar.style.width = '95%';
          signalBar.style.background = 'linear-gradient(90deg, rgba(137, 207, 192, 0.6), rgba(137, 207, 192, 0.4))';
          clarityBar.style.background = 'linear-gradient(90deg, #89CFC0, rgba(137, 207, 192, 0.9))';

          // After transition completes, add subtle fluctuation
          setTimeout(() => {
            signalBar.style.animation = 'signal-fluctuate-mid 3s ease-in-out infinite';
            clarityBar.style.animation = 'clarity-fluctuate-high 4s ease-in-out infinite';
          }, 1600);
        }
      }, 50);
    }
  }

  if (missionNext && bioPanel1 && bioPanel2) {
    missionNext.addEventListener('click', function() {
      console.log('Switching to panel 2');
      bioPanel1.style.display = 'none';
      bioPanel2.style.display = 'block';
      // Small delay to ensure DOM is updated
      setTimeout(() => updateStatusBars(2), 100);
    });
  }

  if (missionPrev2 && bioPanel1 && bioPanel2) {
    missionPrev2.addEventListener('click', function() {
      console.log('Switching to panel 1');
      bioPanel2.style.display = 'none';
      bioPanel1.style.display = 'block';
      // Small delay to ensure DOM is updated
      setTimeout(() => updateStatusBars(1), 100);
    });
  }

  // Set initial state for panel 1 after page loads
  setTimeout(() => updateStatusBars(1), 500);

  // Handle the newsletter button in bio panel 1
  if (newsletterBtnBio1) {
    newsletterBtnBio1.addEventListener('click', function() {
      const newsletterPopup = document.getElementById('newsletter-popup');
      if (newsletterPopup) {
        newsletterPopup.style.display = 'flex';
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Handle the newsletter button in bio panel 2
  if (newsletterBtn2) {
    newsletterBtn2.addEventListener('click', function() {
      const newsletterPopup = document.getElementById('newsletter-popup');
      if (newsletterPopup) {
        newsletterPopup.style.display = 'flex';
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Gear Carousel Functionality
  const carousels = {};
  const carouselBtns = document.querySelectorAll('.carousel-btn');

  carouselBtns.forEach(btn => {
    const carouselId = btn.getAttribute('data-carousel');

    if (!carousels[carouselId]) {
      carousels[carouselId] = {
        element: document.getElementById(`carousel-${carouselId}`),
        currentIndex: 0,
        totalImages: document.querySelectorAll(`#carousel-${carouselId} img`).length
      };
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const carousel = carousels[carouselId];

      if (btn.classList.contains('carousel-prev')) {
        carousel.currentIndex = (carousel.currentIndex - 1 + carousel.totalImages) % carousel.totalImages;
      } else {
        carousel.currentIndex = (carousel.currentIndex + 1) % carousel.totalImages;
      }

      const offset = -carousel.currentIndex * 100;
      carousel.element.style.transform = `translateX(${offset}%)`;
    });
  });
});
