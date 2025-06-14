export class MobileControls {
  constructor() {
    this.keys = {};
    this.setupJoystick();
    this.setupButtons();
    this.isMobile = this.checkMobile();
    
    // Speed control parameters
    this.speedMultiplier = 0.3; 
    this.maxSpeed = 1.5;
    this.minSpeed = 0.15;

    // Track active touches for each joystick
    this.activeTouches = {
      left: null,
      right: null
    };
  }
  
  checkMobile() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }
  
  setupJoystick() {
    this.leftStick = { x: 0, y: 0 };
    this.rightStick = { x: 0, y: 0 };
    const leftJoystick = document.querySelector('.joystick-container.left');
    const rightJoystick = document.querySelector('.joystick-container.right');

    // Setup both joysticks independently
    this.setupJoystickControl(leftJoystick, this.leftStick, true, 'left');
    this.setupJoystickControl(rightJoystick, this.rightStick, false, 'right');
  }
  
  setupJoystickControl(element, stickState, isSpeedControl, side) {
    const stick = element.querySelector('.joystick-stick');
    const base = element.querySelector('.joystick-base');
    
    const resetStick = () => {
      stick.style.transform = '';
      stickState.x = 0;
      stickState.y = 0;
      this.activeTouches[side] = null;
    };
    
    const handleMove = (touch) => {
      const baseRect = base.getBoundingClientRect();
      const maxDistance = baseRect.width / 2;
      
      const deltaX = touch.clientX - baseRect.left - baseRect.width / 2;
      const deltaY = touch.clientY - baseRect.top - baseRect.height / 2;
      
      const distance = Math.min(maxDistance, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
      const angle = Math.atan2(deltaY, deltaX);
      
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
     
      if (isSpeedControl) { 
        // Speed control: up increases speed, down decreases
        stickState.y = moveY / maxDistance;
      } else { 
        // Movement control: up is pitch down, down is pitch up
        stickState.x = moveX / maxDistance;
        stickState.y = -moveY / maxDistance; 
      }
      
      stick.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    const touchStartHandler = (e) => {
      e.preventDefault();
      // Prevent multiple simultaneous touches on the same joystick
      if (this.activeTouches[side]) return;
      
      const touch = e.changedTouches[0];
      this.activeTouches[side] = touch;
      handleMove(touch);
    };
   
    const touchMoveHandler = (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      
      // Only handle moves for the touch that originally started on this joystick
      if (this.activeTouches[side] && this.activeTouches[side].identifier === touch.identifier) {
        handleMove(touch);
      }
    };
   
    const touchEndHandler = (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      
      // Only reset if it's the touch that started on this joystick
      if (this.activeTouches[side] && this.activeTouches[side].identifier === touch.identifier) {
        resetStick();
      }
    };
    
    // Event listeners with proper tracking
    element.addEventListener('touchstart', touchStartHandler);
    element.addEventListener('touchmove', touchMoveHandler);
    element.addEventListener('touchend', touchEndHandler);
    element.addEventListener('touchcancel', touchEndHandler);
  }
  
  setupButtons() {
    // Button setup remains the same as previous version
    const buttons = [
      { id: 'fireBtn', key: 'Space' },
      { id: 'boostBtn', key: 'ShiftLeft' },
      { id: 'brakeBtn', key: 'ControlLeft' },
      { id: 'targetBtn', key: 'Tab' }
    ];

    buttons.forEach(({ id, key }) => {
      const button = document.getElementById(id);
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys[key] = true;
      });
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys[key] = false;
      });
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.keys[key] = false;
      });
    });
  }
  
  update() {
    if (!this.isMobile) return;
    
    // Movement control from right stick 
    if (Math.abs(this.rightStick.x) > 0.1) {
      this.keys['KeyA'] = this.rightStick.x < 0;
      this.keys['KeyD'] = this.rightStick.x > 0;
    } else {
      this.keys['KeyA'] = false;
      this.keys['KeyD'] = false;
    }
    
    // Pitch up/down 
    if (Math.abs(this.rightStick.y) > 0.1) {
      this.keys['KeyW'] = this.rightStick.y > 0; 
      this.keys['KeyS'] = this.rightStick.y < 0; 
    } else {
      this.keys['KeyW'] = false;
      this.keys['KeyS'] = false;
    }
    
    // Speed control from left stick
    if (Math.abs(this.leftStick.y) > 0.1) {
      this.keys['ShiftLeft'] = this.leftStick.y > 0;
      this.keys['ControlLeft'] = this.leftStick.y < 0;
    } else {
      this.keys['ShiftLeft'] = false;
      this.keys['ControlLeft'] = false;
    }
  }
}