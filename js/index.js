const canvasWidth = 800;
const canvasHeight = 500;
let count = 10;
let interval;
let shape;
let isCircle = true;

const clearCanvas = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};

const handleSubmit = () => {
  let input = document.getElementById("count");
  count = parseInt(input.value);
  if (isNaN(count) || count <= 0) {
    count = 10;
  }
  shape = document.getElementById("shape").value;
  isCircle = Boolean(shape === "circle");
  console.log(isCircle);
  clearInterval(interval);
  clearCanvas();
  boxes();
};

const boxes = () => {
  const canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  const boxesArray = [];

  for (let i = 0; i < count; i++) {
    isCircle
      ? // for circles
        boxesArray.push(circle())
      : // for boxes
        boxesArray.push(box());
  }

  // event to erase or destroy the box when user click on it
  canvas.addEventListener("click", (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    // Loop through the boxes or circles and checking if a boll/box is clicked
    for (let i = 0; i < boxesArray.length; i++) {
      const shape = boxesArray[i];

      if (isCircle) {
        const dx = mouseX - shape.x;
        const dy = mouseY - shape.y;
        const distanceSquared = dx ** 2 + dy ** 2;
        if (distanceSquared <= shape.radius ** 2) {
          boxesArray.splice(i, 1);
          i--;
        }
      } else {
        if (
          mouseX >= shape.x &&
          mouseX <= shape.x + shape.width &&
          mouseY >= shape.y &&
          mouseY <= shape.y + shape.height
        ) {
          boxesArray.splice(i, 1);
          i--;
        }
      }
    }
  });

  if (isCircle) {
    //  for circles
    interval = setInterval(() => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let i = 0; i < boxesArray.length; i++) {
        const circleA = boxesArray[i];
        ctx.fillStyle = circleA.color;
        ctx.beginPath();
        ctx.arc(circleA.x, circleA.y, circleA.radius, 0, Math.PI * 2);
        ctx.fill();

        circleA.x += circleA.xSpeed;
        circleA.y += circleA.ySpeed;

        if (
          circleA.x + circleA.radius > canvasWidth ||
          circleA.x - circleA.radius < 0
        ) {
          circleA.xSpeed *= -1;
        }
        if (
          circleA.y + circleA.radius > canvasHeight ||
          circleA.y - circleA.radius < 0
        ) {
          circleA.ySpeed *= -1;
        }
        for (let j = i + 1; j < boxesArray.length; j++) {
          let circleB = boxesArray[j];

          let dx = circleB.x - circleA.x;
          let dy = circleB.y - circleA.y;
          let distanceSquared = dx ** 2 + dy ** 2;

          let radiusSum = circleA.radius + circleB.radius;
          if (distanceSquared < radiusSum ** 2) {
            const distance = Math.sqrt(distanceSquared);
            let overlap = radiusSum - distance;
            let separationDistance = overlap / 2;

            let ux = dx / distance;
            let uy = dy / distance;

            circleA.x -= separationDistance * ux;
            circleA.y -= separationDistance * uy;
            circleB.x += separationDistance * ux;
            circleB.y += separationDistance * uy;

            // Calculate the relative velocity
            let relSpeedX = circleA.xSpeed - circleB.xSpeed;
            let relSpeedY = circleA.ySpeed - circleB.ySpeed;

            // Transfer velocity from fast circle to slow circle and vice versa
            if (Math.abs(relSpeedX) > Math.abs(circleB.xSpeed)) {
              const tempSpeed = circleB.xSpeed;
              circleB.xSpeed = circleA.xSpeed;
              circleA.xSpeed = tempSpeed;
            }
            if (Math.abs(relSpeedY) > Math.abs(circleB.ySpeed)) {
              const tempSpeed = circleB.ySpeed;
              circleB.ySpeed = circleA.ySpeed;
              circleA.ySpeed = tempSpeed;
            }
          }
        }
      }
    }, 1000 / 60);
    return;
  }
  // for boxes
  interval = setInterval(() => {
    // Removing the previous frame
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < boxesArray.length; i++) {
      const boxA = boxesArray[i];
      ctx.fillStyle = boxA.color;
      // creating the rectangle with specific setting
      ctx.fillRect(boxA.x, boxA.y, boxA.width, boxA.height);

      boxA.x += boxA.xSpeed;
      boxA.y += boxA.ySpeed;

      if (boxA.x + boxA.width > canvasWidth || boxA.x < 0) {
        boxA.xSpeed *= -1;
      }
      if (boxA.y + boxA.height > canvasHeight || boxA.y < 0) {
        boxA.ySpeed *= -1;
      }
      //   Checking out certain box with other boxes with loop
      for (let j = i + 1; j < boxesArray.length; j++) {
        // Denoting the second box
        const boxB = boxesArray[j];

        // formula for collision
        let isCollided =
          boxA.x < boxB.x + boxB.width &&
          boxA.x + boxA.width > boxB.x &&
          boxA.y < boxB.y + boxB.height &&
          boxA.y + boxA.height > boxB.y;

        // Checking if the boxes are colliding with simple Collision Detection condition
        if (isCollided) {
          // Calculate overlap vectors
          const overlapX = Math.min(
            boxA.x + boxA.width - boxB.x,
            boxB.x + boxB.width - boxA.x
          );
          const overlapY = Math.min(
            boxA.y + boxA.height - boxB.y,
            boxB.y + boxB.height - boxA.y
          );

          // Calculate separation vectors
          const separationX = overlapX / 2;
          const separationY = overlapY / 2;

          // Move boxes apart
          if (overlapX < overlapY) {
            if (boxA.x < boxB.x) {
              boxA.x -= separationX;
              boxB.x += separationX;
            } else {
              boxA.x += separationX;
              boxB.x -= separationX;
            }

            // Transfer velocity from fast box to slow box and vice versa
            if (Math.abs(boxA.xSpeed) > Math.abs(boxB.xSpeed)) {
              const tempSpeed = boxB.xSpeed;
              boxB.xSpeed = boxA.xSpeed;
              boxA.xSpeed = tempSpeed;
            }
          } else {
            if (boxA.y < boxB.y) {
              boxA.y -= separationY;
              boxB.y += separationY;
            } else {
              boxA.y += separationY;
              boxB.y -= separationY;
            }

            // Transfer velocity from fast box to slow box and vice versa
            if (Math.abs(boxA.ySpeed) > Math.abs(boxB.ySpeed)) {
              const tempSpeed = boxB.ySpeed;
              boxB.ySpeed = boxA.ySpeed;
              boxA.ySpeed = tempSpeed;
            }
          }

          // If boxes are collide changing the directive of boxes
          boxA.xSpeed *= -1;
          boxA.ySpeed *= -1;
          boxB.xSpeed *= -1;
          boxB.ySpeed *= -1;
        }
      }
    }
  }, 1000 / 60);
};

// Defining the simple box
const box = () => {
  const width = 20;
  const height = 20;
  const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`;
  const x = Math.random() * (canvasWidth - (width + height) / 2);
  const y = Math.random() * (canvasHeight - (width + height) / 2);

  const xSpeed = Math.random() * 7 + 1;
  const ySpeed = Math.random() * 7 + 1;

  return {
    width: width,
    height: height,
    color: color,
    x: x,
    y: y,
    xSpeed: xSpeed,
    ySpeed: ySpeed,
  };
};

const circle = () => {
  const radius = 10;
  const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`;
  const x = Math.random() * (canvasWidth - radius);
  const y = Math.random() * (canvasHeight - radius);

  const xSpeed = Math.random() * 7 + 1;
  const ySpeed = Math.random() * 7 + 1;

  return {
    radius: radius,
    color: color,
    x: x,
    y: y,
    xSpeed: xSpeed,
    ySpeed: ySpeed,
  };
};

window.onload = () => {
  boxes();
};
