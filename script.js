// JavaScript for AI Dating Landing Page

let activeExplodingHearts = []; // Array to hold active heart animation data

// Main animation loop for exploding hearts
function animateExplodingHearts(currentTime) {
    // console.log(`Animating hearts at time: ${currentTime}, Count: ${activeExplodingHearts.length}`); // Debug Log 1 << RE-COMMENTED
    const heartsToRemoveFromDOM = [];
    let isFirstHeart = true; // Flag to log only the first heart per frame

    // Filter out completed animations and update active ones
    activeExplodingHearts = activeExplodingHearts.filter(heartData => {
        if (!heartData || !heartData.startTime) { // Basic check for valid data
             console.error("Invalid heartData:", heartData);
             return false;
        }
        const elapsedTime = currentTime - heartData.startTime;
        // Apply ease-out easing (progress slows down towards the end)
        // Example: quadratic ease-out: progress = 1 - (1 - t) * (1 - t) where t = elapsedTime / duration
        const t = Math.min(1, elapsedTime / heartData.duration); // Raw progress (0 to 1)
        const progress = 1 - (1 - t) * (1 - t); // Quadratic ease-out progress

        if (elapsedTime >= heartData.duration) {
            // Animation finished
            // if (isFirstHeart) console.log(`Heart finished: ${heartData.element.id || 'no-id'}`); // Debug Log 2
            heartsToRemoveFromDOM.push(heartData.element);
            return false; // Remove from activeExplodingHearts array
        }

        // Linear interpolation (lerp) using eased progress
        const currentX = heartData.startX + (heartData.finalX - heartData.startX) * progress;
        // REMOVED window.scrollY addition - hearts are absolute within a fixed container
        const currentY = heartData.startY + (heartData.finalY - heartData.startY) * progress;
        const currentScale = heartData.startScale + (heartData.endScale - heartData.startScale) * progress;
        const currentOpacity = heartData.startOpacity + (heartData.endOpacity - heartData.startOpacity) * progress;

        // Apply styles directly
        try {
            heartData.element.style.left = `${currentX}px`;
            heartData.element.style.top = `${currentY}px`;
            heartData.element.style.opacity = currentOpacity;
            // Only apply scale via transform
            heartData.element.style.transform = `scale(${currentScale})`;

            // Log values for the first heart in the loop for one frame
            // if (isFirstHeart) {
            //     console.log(`Heart Update: t=${t.toFixed(2)}, prog=${progress.toFixed(2)}, X=${currentX.toFixed(0)}, Y=${currentY.toFixed(0)}, Scale=${currentScale.toFixed(2)}, Opacity=${currentOpacity.toFixed(2)}`); // Debug Log 3 << RE-COMMENTED
            //     isFirstHeart = false;
            // }

        } catch (e) {
             console.error("Error applying styles:", e, heartData);
             // Optionally remove problematic heart data here
             heartsToRemoveFromDOM.push(heartData.element); // Remove if styling fails
             return false;
        }


        return true; // Keep in activeExplodingHearts array
    });

    // Remove completed hearts from DOM
    heartsToRemoveFromDOM.forEach(heartElement => heartElement.remove());

    // Continue the loop
    requestAnimationFrame(animateExplodingHearts);
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Dating script loaded.');
    window.scrollTo(0, 0); // Ensure page starts at the very top

    const effectsContainer = document.getElementById('fixed-effects-container'); // Get the container for effects
    if (!effectsContainer) {
        console.error("Fixed effects container not found!");
        // Optionally, create it dynamically if it's missing
        // effectsContainer = document.createElement('div');
        // effectsContainer.id = 'fixed-effects-container';
        // document.body.insertBefore(effectsContainer, document.body.firstChild);
        // Add CSS styles dynamically or ensure they are in the CSS file
    }

    // --- Smooth Scrolling ---
    const header = document.getElementById('header'); // Get the header element
    const headerHeight = header ? header.offsetHeight : 0; // Get header height, default to 0 if not found
    const navLinks = document.querySelectorAll('nav ul li a[href^="#"], .cta-button[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor jump behavior
            const targetId = this.getAttribute('href');

            // Special case for "Home" link
            if (targetId === '#hero') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return; // Stop further execution for Home link
            }

            // For other links
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top; // Position relative to viewport
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight; // Calculate final position considering header

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
    });
});

// --- Herzchen-Explosion bei Klick ---
document.addEventListener('click', function(event) {
    // Prevent heart explosion if the click is on any interactive balloon
    if (event.target.closest('.interactive-balloon')) { // Check for the class instead of ID
        return; // Do nothing if the click is on any balloon
    }

    const numberOfHearts = 10; // Anzahl der Herzen pro Klick
    const clickX = event.clientX;
    const clickY = event.clientY;

    for (let i = 0; i < numberOfHearts; i++) {
        const heart = document.createElement('div');
        heart.classList.add('click-heart');

        // Startposition am Klickpunkt
        heart.style.left = `${clickX}px`;
        heart.style.top = `${clickY}px`;

        // Zufällige Endposition für die Explosion (CSS Variablen für Keyframes)
        // Faktor bestimmt, wie weit die Herzen fliegen
        const explosionFactor = 50 + Math.random() * 50; // Fliegt 50-100px weit
        const angle = Math.random() * Math.PI * 2; // Zufälliger Winkel (0-360 Grad)
        const targetX = Math.cos(angle) * explosionFactor;
        const targetY = Math.sin(angle) * explosionFactor;

        // Calculate final absolute position
        const finalX = clickX + targetX;
        const finalY = clickY + targetY;

        // --tx and --ty are no longer used by the animation

        if (effectsContainer) { // Append to container if it exists
            effectsContainer.appendChild(heart);
        } else {
            document.body.appendChild(heart); // Fallback to body
        }

        // Add heart data to the animation loop
        activeExplodingHearts.push({
            element: heart,
            startTime: performance.now(), // Use performance.now()
            duration: 600, // Duration for general click hearts
            startX: clickX,
            startY: clickY,
            finalX: finalX,
            finalY: finalY,
            startScale: 1,
            endScale: 0,
            startOpacity: 0.8,
            endOpacity: 0
        });

        // Remove the setTimeout for removal, animation loop handles it
        // setTimeout(() => {
        //     heart.remove();
        // }, 600);
    }
});
// --- Ende Herzchen-Explosion ---

    // --- Custom Cursor (Heart + Swarm) ---
    // Create div for image cursor
    const cursorHeart = document.createElement('div'); // Use div for image background
    cursorHeart.classList.add('custom-cursor');
    // cursorHeart.textContent = '❤️'; // REMOVED: Emoji text content
    document.body.appendChild(cursorHeart);

    const swarmDots = [];
    const numSwarmDots = 5; // Number of trailing dots
    const baseDotSize = 20; // Increased base size (slightly smaller than 24px cursor)
    const sizeDecrement = 2.5; // Increased size decrement for more noticeable shrinking

    for (let i = 0; i < numSwarmDots; i++) {
        // Use div for simple circle dots
        const dot = document.createElement('div'); // Use div for simple background color styling
        dot.classList.add('cursor-swarm-dot');
        // dot.textContent = '❤️'; // REMOVED: Emoji text content
        const dotSize = Math.max(2, baseDotSize - i * sizeDecrement); // Ensure minimum size
        dot.style.width = `${dotSize}px`; // Set width
        dot.style.height = `${dotSize}px`; // Set height
        // dot.style.fontSize = `${fontSize}px`; // REMOVED: Font size not needed
        document.body.appendChild(dot);
        swarmDots.push({ element: dot, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Move main cursor - centering based on CSS width/height
        cursorHeart.style.transform = `translate(${mouseX}px, ${mouseY}px)`; // CSS handles centering with translate(-50%, -50%)

        // Move swarm dots with delay
        let currentX = mouseX;
        let currentY = mouseY;

        swarmDots.forEach((dot, index) => {
            // Calculate delay factor - further dots move slower initially
            // Decreased factors for more spacing
            const delayFactor = 0.1 + index * 0.02; // Decreased values for slower reaction -> more spacing

            dot.x += (currentX - dot.x) * delayFactor;
            dot.y += (currentY - dot.y) * delayFactor;

            // Centering based on CSS width/height
            dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px)`; // CSS handles centering with translate(-50%, -50%)
            // Opacity is set in CSS, but could be dynamically adjusted here if needed
            // dot.element.style.opacity = 0.3; // Example if dynamic opacity needed

            // Update position for the next dot to follow
            currentX = dot.x;
            currentY = dot.y;
        });

        requestAnimationFrame(animateCursor);
    }

    animateCursor(); // Start the animation loop

    // --- Cursor Image Switching ---
    const headerElement = document.getElementById('header');
    const defaultCursorImage = "url('assets/images/herz_cursor.png')";
    const lightCursorImage = "url('assets/images/herz_cursor_light.png')";

    if (headerElement) {
        headerElement.addEventListener('mouseenter', () => {
            cursorHeart.style.backgroundImage = lightCursorImage;
            swarmDots.forEach(dot => {
                dot.element.style.backgroundImage = lightCursorImage;
            });
        });

        headerElement.addEventListener('mouseleave', () => {
            cursorHeart.style.backgroundImage = defaultCursorImage;
            swarmDots.forEach(dot => {
                dot.element.style.backgroundImage = defaultCursorImage;
            });
        });
    }
    // Note: This only works for the header. For other elements, more complex logic
    // (like checking element under cursor on mousemove) would be needed.


    // --- Scroll Animations ---
    // Observer for general sections (Fade-in, excluding #vision, #roadmap, #how-it-works)
    const sectionsToFade = document.querySelectorAll('section:not(#vision):not(#roadmap):not(#how-it-works)');
    const sectionObserverOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px', // No margin
        threshold: 0.4 // Trigger fade-in when 40% visible
    };

    const sectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); // Add .is-visible for fade-in
                observer.unobserve(entry.target); // Stop observing section once visible
            }
        });
    };

    const sectionIntersectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);

    sectionsToFade.forEach(section => {
        section.classList.add('fade-in-section'); // Add base class for fade-in
        sectionIntersectionObserver.observe(section);
    });

    // --- Staggered Slide-Up Animation for #vision section REMOVED ---
    // The corresponding CSS class .slide-up-staggered has also been removed.


    // --- IntersectionObserver for individual process steps (Slide-in, One-time) ---
    const stepsToSlide = document.querySelectorAll('#how-it-works .process-step');
    const stepObserverOptions = {
        root: null,
        // Trigger when the element is 150px from the bottom edge of the viewport
        // Adjust the '-150px' value: smaller negative value (e.g., -50px) triggers earlier,
        // larger negative value (e.g., -250px) triggers later. 0px triggers right at the edge.
        rootMargin: '0px 0px -100px 0px',
        threshold: 0 // Trigger as soon as any part enters the margin area
    };

    const stepObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); // Add class to the specific step
                observer.unobserve(entry.target); // Stop observing this step
            }
        });
    };

    const stepIntersectionObserver = new IntersectionObserver(stepObserverCallback, stepObserverOptions);

    stepsToSlide.forEach(step => {
        stepIntersectionObserver.observe(step);
    });
    // --- End IntersectionObserver for process steps ---


    // --- Vision Block Slide-Up Animation ---
    const visionBlocksToAnimate = document.querySelectorAll('#vision .vision-block');
    const visionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the block is visible
    };

    const visionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };

    const visionIntersectionObserver = new IntersectionObserver(visionObserverCallback, visionObserverOptions);

    visionBlocksToAnimate.forEach(block => {
        visionIntersectionObserver.observe(block);
    });
    // --- End Vision Block Animation ---


    // --- Roadmap Scroll Animation (Staggered Parallax Style) ---
    const timelineItems = document.querySelectorAll('#roadmap .timeline-item');

    function handleIndividualRoadmapScroll() {
        if (timelineItems.length === 0) return;

        const viewportHeight = window.innerHeight;

        // Define the vertical range within the viewport where animation occurs for EACH item
        // Start when item top enters bottom 80% of viewport
        // End when item top reaches top 20% of viewport
        const startAnimatePoint = viewportHeight * 0.9;
        const endAnimatePoint = viewportHeight * 0.35;
        const animationDistance = startAnimatePoint - endAnimatePoint;

        if (animationDistance <= 0) return; // Avoid division by zero or invalid range

        timelineItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top;

            // Calculate the current position of THIS ITEM's top relative to the start point
            const currentItemPosition = startAnimatePoint - itemTop;

            // Calculate progress for THIS ITEM (0 to 1) based on its position within the animation zone
            let progress = currentItemPosition / animationDistance;

            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Apply the calculated progress to THIS specific item's CSS variable
            // The CSS transform rule `transform: translateX(calc(SIGN * 100% * (1 - var(--scroll-progress, 0))));`
            // will use this value to move the item.
            item.style.setProperty('--scroll-progress', progress);
            // Opacity is handled by CSS (always 1)
        });
    }

    // Add scroll listener if items exist
    if (timelineItems.length > 0) {
        // Initial calculation needed in case the page loads scrolled down
        handleIndividualRoadmapScroll();
        window.addEventListener('scroll', handleIndividualRoadmapScroll);
    }
    // --- End Roadmap Scroll Animation ---


    // --- How It Works Scroll Animation REMOVED ---


    // --- Future JavaScript code for other interactions goes here ---
    // Simulated NLSA Interaction

    // --- Rising Hearts ---
    let currentHeartCount = 0;
    const maxHearts = 20; // Limit the maximum number of hearts on screen

    function createRisingHeart() {
        if (currentHeartCount >= maxHearts) {
            return; // Don't create more hearts if limit is reached
        }

        currentHeartCount++; // Increment count
        const heart = document.createElement('div'); // Change to div for background image
        heart.classList.add('rising-heart');
        // heart.textContent = '❤️'; // REMOVED: Emoji text content

        // Randomize properties based on plan
        const size = Math.random() * (50 - 20) + 20; // Random size 20px to 50px
        const opacity = Math.random() * (0.5 - 0.2) + 0.2; // 20% to 50%
        const horizontalPosition = Math.random() * 100; // 0% to 100% vw
        const animationDuration = Math.random() * 5 + 4; // 4s to 9s duration
        // const color = Math.random() < 0.5 ? 'var(--color-primary-accent)' : 'var(--color-secondary-accent)'; // REMOVED: Color comes from image

        heart.style.width = `${size}px`; // Set width
        heart.style.height = `${size}px`; // Set height (assuming square aspect ratio for heart image)
        // heart.style.fontSize = `${size}px`; // REMOVED: Font size not relevant
        heart.style.left = `${horizontalPosition}vw`;
        heart.style.setProperty('--start-opacity', opacity); // Set CSS variable for start opacity
        // heart.style.color = color; // REMOVED: Color comes from image
        heart.style.animationDuration = `${animationDuration}s`;
        // Optional: Add slight random horizontal drift or rotation? For now, just vertical.

        // Position relative to body or a specific container (e.g., header)
        // For simplicity, appending to body and starting from bottom:0 in CSS
        document.body.appendChild(heart);

        // Remove heart after animation finishes to prevent clutter
        heart.addEventListener('animationend', () => {
            heart.remove();
            currentHeartCount--; // Decrement count when heart is removed
        });
    }

    // Create hearts at intervals
    setInterval(createRisingHeart, 700); // Adjust interval (milliseconds) for density

    // --- Contract Address Copy Button ---
    const copyButton = document.getElementById('copyButton');
    const contractAddressSpan = document.getElementById('contractAddress');

    if (copyButton && contractAddressSpan) {
        copyButton.addEventListener('click', () => {
            const address = contractAddressSpan.textContent;
            navigator.clipboard.writeText(address).then(() => {
                // Optional: Provide visual feedback
                const originalText = copyButton.textContent;
                copyButton.textContent = 'COPIED!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 1500); // Change back after 1.5 seconds
            }).catch(err => {
                console.error('Failed to copy address: ', err);
                // Optional: Show an error message to the user
            });
        });
    }

    // --- Vision Block Hover Effect (Glowing Cursor) ---
    const visionBlocks = document.querySelectorAll('.vision-block');

    visionBlocks.forEach(block => {
        const blob = block.querySelector('.vision-blob');

        if (!blob) return; // Skip if blob element not found

        block.addEventListener('mousemove', (e) => {
            const rect = block.getBoundingClientRect();
            // Calculate mouse position relative to the block's top-left corner
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Update blob position
            // The CSS transform: translate(-50%, -50%) will center the blob on these coordinates
            blob.style.left = `${mouseX}px`;
            blob.style.top = `${mouseY}px`;
        });

        block.addEventListener('mouseenter', () => {
            blob.style.opacity = '1'; // Show blob
        });

        block.addEventListener('mouseleave', () => {
            blob.style.opacity = '0'; // Hide blob
        });
    });

    // --- Disable Right-Click Context Menu ---
    document.addEventListener('contextmenu', event => event.preventDefault());

    // --- Scroll to Top Button Logic ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const heroSection = document.getElementById('hero');

    if (scrollToTopBtn && heroSection) {
        // Function to check scroll position and toggle button visibility
        const checkScroll = () => {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            // Check if the bottom of the hero section is above the viewport top
            if (heroBottom < 0) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', checkScroll);

        // Initial check in case the page loads already scrolled down
        checkScroll();

        // Add click event listener to scroll to top
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.error('Scroll to top button or hero section not found.');
    }

    // --- List of Balloon Messages ---
    const balloonMessages = [
        "You make the world brighter.",
        "Buy $AIDATING",
        "So glad you're here!",
        "Keep shining!",
        "You've got this!",
        "Sending good vibes your way.",
        "You're awesome!",
        "Have a wonderful day!",
        "You're doing great!",
        "What a lovely encounter!",
        "Buy $AIDATING",
        "You are appreciated.",
        "Your smile is contagious.",
        "Be kind to yourself today.",
        "You matter.",
        "Just a little hello!",
        "Hope this makes you smile.",
        "You're one of a kind.",
        "Keep being amazing!",
        "A little spark for you!",
        "You brighten my day!",
        "It's lovely that you exist."
    ];

    // --- Interactive Balloon Logic (Handles Multiple Balloons) ---
    // Selects all elements with the class '.interactive-balloon'.
    // Each balloon element should have:
    // - An ID (e.g., id="hero-balloon-1")
    // - A 'data-balloon-id' attribute for logical grouping (e.g., data-balloon-id="hero-1")
    // - A 'data-message-target' attribute pointing to the ID of its corresponding message element (e.g., data-message-target="#hero-balloon-1-message")
    const interactiveBalloons = document.querySelectorAll('.interactive-balloon'); // Select all balloons

    interactiveBalloons.forEach(balloon => { // Loop through each balloon
        // Get the selector for the associated message element from the balloon's data attribute.
        const messageTargetSelector = balloon.getAttribute('data-message-target');
        // Find the specific message element using the selector.
        // The message element should also have a matching 'data-balloon-id' (e.g., data-balloon-id="hero-1").
        const balloonMessage = document.querySelector(messageTargetSelector); // Find the specific message element

        if (!balloonMessage) {
            console.error(`Message element not found for balloon: ${balloon.id} using selector: ${messageTargetSelector}`);
            return; // Skip this balloon if message not found
        }

        // --- Balloon Click Event ---
        // Handles the popping animation, heart explosion, and message display when a balloon is clicked.
        balloon.addEventListener('click', (event) => { // Add event parameter
            event.stopPropagation(); // Prevent click from bubbling up to document (stops general click heart explosion)

            // Prevent multiple clicks while popping
            if (balloon.classList.contains('popping')) { // Use 'balloon' (current element in loop)
                return;
            }

            // 1. Trigger Popping Animation:
            // Add the 'popping' class to start the general animation defined in CSS.
            balloon.classList.add('popping'); // Use 'balloon'
            // Check if this specific balloon needs a custom animation override (defined in CSS @keyframes).
            if (balloon.id === 'how-it-works-balloon-1') {
                // Assign the specific animation name for this balloon.
                balloon.style.animationName = 'popEffectHowItWorksBalloon';
            } else if (balloon.id === 'how-it-works-balloon-2') { // Added case for the new balloon
                // Assign the specific animation name for this balloon.
                balloon.style.animationName = 'popEffectHowItWorksBalloon2';
            } else if (balloon.id === 'test-balloon') {
                 // Assign the specific animation name for the test balloon.
                 balloon.style.animationName = 'popEffectTestBalloon'; // Explicitly set for clarity, though CSS might handle it
            } else if (balloon.id === 'roadmap-balloon-1') { // Added case for the roadmap balloon
                 // Assign the specific animation name for this balloon.
                 balloon.style.animationName = 'popEffectRoadmapBalloon1';
            } else if (balloon.id === 'new-section-balloon-1') { // Added case for the new section balloon
                // Assign the specific animation name for this balloon.
                balloon.style.animationName = 'popEffectNewSectionBalloon1';
            } else {
                 // Other balloons use the default 'popEffect' animation assigned via the '.popping' class in CSS.
                 balloon.style.animationName = 'popEffect'; // Explicitly set default
            }

            // 2. Trigger Heart Explosion Effect:
            // Call the function to create exploding hearts originating from the balloon's center.
            // A slight delay is added before the explosion starts.
            setTimeout(() => {
                starteBallonHerzSchweben(event); // Call the new function inside setTimeout
            }, 100); // Delay in milliseconds (e.g., 100ms = 0.1s)
            // --- End Balloon Heart Explosion ---

            // 3. Display Random Message:
            // Select a random message from the predefined list.
            const randomIndex = Math.floor(Math.random() * balloonMessages.length);
            const randomMessage = balloonMessages[randomIndex];
            // Set the text content of the associated message element.
            balloonMessage.textContent = randomMessage; // Set the text content
            // --- End select and set random message ---

            // 4. Show and Hide Message:
            // Show the message element shortly after the pop starts by adding the 'is-shown' class.
            setTimeout(() => {
                balloonMessage.classList.add('is-shown'); // Use 'balloonMessage' (specific message for this balloon)
            }, 100); // Show message slightly after pop starts

            // Hide the message element after a delay by removing the 'is-shown' class.
            setTimeout(() => {
                balloonMessage.classList.remove('is-shown'); // Use 'balloonMessage'
                // Optional: Remove the balloon element entirely after it fades out (currently commented out).
                // setTimeout(() => {
                //     balloon.remove(); // Use 'balloon'
                // }, 300); // Wait for message fade-out transition
            }, 5000); // Keep message visible for 5 seconds (changed from 3000)

            // Reset balloon state after animation (if not removing it)
            // We might want to respawn it or just leave it gone for this test
            // Reset balloon state after 10 seconds to make it reappear
            setTimeout(() => {
                balloon.classList.remove('popping'); // Remove popping class
                balloon.style.animationName = ''; // Reset specific animation name
                // Ensure opacity and transform transition smoothly back (handled by CSS transition)
            }, 10000); // 10 seconds delay

        }); // End click listener

        // --- Balloon Hover Effect ---
        // Handles scaling and slight rotation adjustment on mouse enter/leave.
        balloon.addEventListener('mouseenter', () => { // Attach to current 'balloon'
            // console.log('Mouse enter balloon'); // Debug log (optional)
            // Don't apply hover effect if the balloon is currently popping.
            if (balloon.classList.contains('popping')) { // Use 'balloon'
                // console.log('Hover ignored: balloon is popping'); // Debug log (optional)
                return;
            }
            // Get the balloon's initial rotation defined in CSS via the '--initial-rotation' variable.
            const style = getComputedStyle(balloon); // Use 'balloon'
            const initialRotationString = style.getPropertyValue('--initial-rotation').trim();
            const initialRotation = parseFloat(initialRotationString); // Get initial rotation in degrees

            // Calculate target rotation: move 5 degrees towards 0 degrees from the initial angle.
            let targetRotation = initialRotation;
            if (initialRotation < 0) { // If initial rotation is negative
                targetRotation = Math.min(0, initialRotation + 5); // Add 5 degrees, but don't exceed 0.
            } else if (initialRotation > 0) { // If initial rotation is positive
                targetRotation = Math.max(0, initialRotation - 5); // Subtract 5 degrees, but don't go below 0.
            }
            // console.log(`Initial rotation: ${initialRotation}deg, Target rotation: ${targetRotation}deg`); // Debug log

            // Apply hover scale (1.1) and the calculated target rotation using CSS variables.
            // These variables are used by the balloon's transform style in CSS.
            balloon.style.setProperty('--current-scale', '1.1'); // Use 'balloon'
            balloon.style.setProperty('--current-rotation', `${targetRotation}deg`); // Use 'balloon'
            // console.log('Set hover styles: scale=1.1, rotation=' + targetRotation + 'deg'); // Debug log (optional)
        });

        balloon.addEventListener('mouseleave', () => { // Attach to current 'balloon'
            // console.log('Mouse leave balloon'); // Debug log (optional)
            // Reset scale and rotation back to their initial values when the mouse leaves.
            balloon.style.setProperty('--current-scale', '1'); // Reset scale to 1.
            balloon.style.setProperty('--current-rotation', 'var(--initial-rotation)'); // Reset rotation to the initial value.
            // console.log('Reset hover styles'); // Debug log (optional)
        });
        // --- End Balloon Hover Effect ---

    }); // End forEach loop for interactiveBalloons
    // --- End Interactive Balloon Logic ---


    // --- Function for Balloon Heart Explosion (Reusing General Click Explosion Logic) ---
    // Creates a burst of heart particles originating from the center of the clicked balloon.

    // --- Function for Balloon Heart Explosion (Reusing General Click Explosion Logic) ---
    function starteBallonHerzSchweben(event) {
        console.log('starteBallonHerzSchweben aufgerufen!'); // Debugging log
        const balloonRect = event.target.getBoundingClientRect();
        // Calculate center of the balloon
        const balloonCenterX = balloonRect.left + balloonRect.width / 2;
        const balloonCenterY = balloonRect.top + balloonRect.height / 2;
        console.log(`Ballon Mitte: X=${balloonCenterX}, Y=${balloonCenterY}`); // Debugging log
        const numberOfHearts = 25; // Set number of hearts to 25 (as per user's last edit)
        // const startRadius = 125; // REMOVED fixed start radius

        for (let i = 0; i < numberOfHearts; i++) {
            const heart = document.createElement('div');
            heart.classList.add('click-heart'); // Use the existing class for click hearts

            // Create an inner element for the image and rotation
            const heartInner = document.createElement('div');
            heartInner.classList.add('click-heart-inner');

            // Calculate a more evenly distributed starting angle with slight randomness
            const baseAngle = (i / numberOfHearts) * Math.PI * 2; // Base angle for even distribution
            const randomOffset = (Math.random() - 0.5) * (Math.PI / numberOfHearts); // Small random offset
            const startAngle = baseAngle + randomOffset;

            // --- Calculate random start radius ---
            const minStartRadius = 100;
            const maxStartRadius = 150;
            const randomStartRadius = Math.random() * (maxStartRadius - minStartRadius) + minStartRadius;
            // --- End random start radius ---

            // Calculate start position using the RANDOM radius
            const startX = balloonCenterX + Math.cos(startAngle) * randomStartRadius; // Use randomStartRadius
            const startY = balloonCenterY + Math.sin(startAngle) * randomStartRadius; // Use randomStartRadius


            // --- Calculate and set random size ---
            const minSize = 25;
            const maxSize = 55;
            const randomSize = Math.random() * (maxSize - minSize) + minSize;
            heart.style.width = `${randomSize}px`;
            heart.style.height = `${randomSize}px`;
            // --- End random size ---

            // Set initial position
            heart.style.left = `${startX}px`;
            heart.style.top = `${startY}px`;

            // --- Reuse logic from general click explosion for target position ---
            const explosionFactor = 150 + Math.random() * 100; // ADJUSTED factor: 150px to 250px distance
            // const targetAngle = Math.random() * Math.PI * 2; // REMOVED: Use startAngle for direction
            const targetAngle = startAngle; // Use the same angle as the start position for outward movement
            const targetX = Math.cos(targetAngle) * explosionFactor;
            const targetY = Math.sin(targetAngle) * explosionFactor;

            // Calculate final absolute position
            const finalX = startX + targetX;
            const finalY = startY + targetY;

            // Set CSS Variables for the 'explodeHeart' animation (top/left for Endposition) - REMOVED
            // heart.style.setProperty('--final-left', `${finalX}px`);
            // heart.style.setProperty('--final-top', `${finalY}px`);
             // --tx and --ty are no longer used by the animation
            // --- End reused logic ---

            // --- Add random rotation to the inner element ---
            const randomRotation = Math.random() * 120 - 60; // Angle between -60 and +60 degrees
            heartInner.style.transform = `rotate(${randomRotation}deg)`;
            // --- End random rotation ---

            heart.appendChild(heartInner); // Add inner element to the heart container
            if (effectsContainer) { // Append to container if it exists
                effectsContainer.appendChild(heart);
            } else {
                document.body.appendChild(heart); // Fallback to body
            }

            // Add heart data to the animation loop
        activeExplodingHearts.push({
            element: heart,
            startTime: performance.now(), // Use performance.now()
            duration: 3000, // Duration for balloon explosion hearts
            startX: startX,
                startY: startY,
                finalX: finalX,
                finalY: finalY,
                startScale: 1,
                endScale: 0,
                startOpacity: 0.8,
                endOpacity: 0
            });

            // Remove the setTimeout for removal, animation loop handles it
            // setTimeout(() => {
            //     heart.remove();
            // }, 3000);
        }
    }
    // --- End Function for Balloon Heart Explosion ---

    // Start the animation loop once the DOM is ready
    requestAnimationFrame(animateExplodingHearts);
});
