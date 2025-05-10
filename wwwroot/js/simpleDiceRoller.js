// Сохраните этот файл как wwwroot/js/simpleDiceRoller.js
// НЕ используйте модули для упрощения отладки

// Глобальные переменные
let scene, camera, renderer, cube;

// Инициализация Three.js

// Добавьте в начало вашего JavaScript файла
window.checkWebGLSupport = function () {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');

        if (!gl) {
            console.error("WebGL не поддерживается. 3D графика не будет работать.");
            return false;
        }

        console.log("WebGL поддерживается!");
        return true;
    } catch (e) {
        console.error("Ошибка при проверке WebGL:", e);
        return false;
    }
}


window.initSimpleDice = function () {
    console.log("Инициализация простого 3D куба...");

    const container = document.getElementById('blazor-dice-container');
    if (!container) {
        console.error("Контейнер blazor-dice-container не найден!");
        return;
    }

    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    // Создаем камеру
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    // Создаем рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Создаем куб
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Запускаем анимацию
    animate();

    console.log("3D куб инициализирован");
}

// Вращение куба
window.rotateCube = function () {
    if (cube) {
        cube.rotation.x += 1;
        cube.rotation.y += 1;
    }
}

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Медленное вращение
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    // Рендеринг
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}