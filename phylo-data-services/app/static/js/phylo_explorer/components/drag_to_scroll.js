document.addEventListener("DOMContentLoaded", function () {
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;
  let velocityX = 0,
    velocityY = 0;
  let lastX = 0,
    lastY = 0;
  let rafId;
  let moved = false; // Track if mouse moved

  const easeScroll = () => {
    velocityX *= 0.95; // Apply friction
    velocityY *= 0.95;

    if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
      window.scrollBy(-velocityX, -velocityY);
      rafId = requestAnimationFrame(easeScroll);
    }
  };

  document.addEventListener("mousedown", (e) => {
    isDragging = true;
    moved = false; // Reset move detection
    startX = e.clientX;
    startY = e.clientY;
    scrollLeft =
      document.documentElement.scrollLeft || document.body.scrollLeft;
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    velocityX = 0;
    velocityY = 0;
    lastX = startX;
    lastY = startY;
    document.body.style.cursor = "grabbing";
    cancelAnimationFrame(rafId);
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;

    // Detect if the user moved enough to start dragging
    if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
      moved = true;
    }

    if (moved) {
      velocityX = deltaX * 0.4;
      velocityY = deltaY * 0.4;
      window.scrollBy(-velocityX, -velocityY);
      e.preventDefault(); // Prevent text selection only if dragging
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  document.addEventListener("mouseup", () => {
    if (!moved) {
      // If mouse wasn't moved much, allow normal click behavior
      document.body.style.cursor = "default";
      isDragging = false;
      return;
    }

    isDragging = false;
    document.body.style.cursor = "default";
    requestAnimationFrame(easeScroll);
  });

  document.addEventListener("mouseleave", () => {
    isDragging = false;
    document.body.style.cursor = "default";
  });
});
