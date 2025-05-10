import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import CANNON from 'https://cdn.skypack.dev/cannon@0.6.2';

let scene, camera, renderer, world, dice = null;
let lastDiceType = 'd6';
let isDiceRolling = false;
let resultTimeout;

// Функция инициализации, вызываемая из Blazor
window.initDiceRoller = function () {
    // Здесь весь код из функции init()
    init();
}

// Функция для получения результата броска (для вызова из Blazor)
window.getDiceResult = function () {
    const resultElement = document.getElementById('result');
    return resultElement.textContent.replace('Результат: ', '');
}

// Функция для броска кубика определенного типа (для вызова из Blazor)
window.rollDiceOfType = function (diceType) {
    if (lastDiceType !== diceType) {
        lastDiceType = diceType;
        resetDice();
    }
    rollDice();
}

window.rollDice = function () {
    // Вызываем вашу внутреннюю функцию rollDice
    rollDice();
}

// Инициализация сцены и физики
function init() {
    // Сцена Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x303030);

    // Камера
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);

    // Рендерер
    const container = document.getElementById('blazor-dice-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Управление камерой
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Физический мир
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 20;

    // Создание пола
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.7,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Физическое тело для пола
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);

    // Создаем стены для ограничения пространства
    createWalls();

    // Обработчик изменения размера окна
    window.addEventListener('resize', onWindowResize);

    // Обработчик кнопки броска
    document.getElementById('roll-button').addEventListener('click', rollDice);

    // Обработчики выбора типа кубика
    document.querySelectorAll('input[name="diceType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            lastDiceType = e.target.value;
            resetDice();
        });
    });

    // Создаем кубик по умолчанию
    createDice(lastDiceType);

    // Запускаем анимацию
    animate();
}

// Создание стен
function createWalls() {
    const wallSize = 30;
    const wallHeight = 5;
    const wallThickness = 1;

    // Материал стены (полупрозрачный)
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.2,
        roughness: 0.5
    });

    // Стена 1 (задняя)
    const wall1Geometry = new THREE.BoxGeometry(wallSize, wallHeight, wallThickness);
    const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
    wall1.position.set(0, wallHeight / 2, -wallSize / 2);
    scene.add(wall1);

    const wall1Shape = new CANNON.Box(new CANNON.Vec3(wallSize / 2, wallHeight / 2, wallThickness / 2));
    const wall1Body = new CANNON.Body({ mass: 0 });
    wall1Body.addShape(wall1Shape);
    wall1Body.position.set(0, wallHeight / 2, -wallSize / 2);
    world.addBody(wall1Body);

    // Стена 2 (левая)
    const wall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallSize);
    const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
    wall2.position.set(-wallSize / 2, wallHeight / 2, 0);
    scene.add(wall2);

    const wall2Shape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, wallSize / 2));
    const wall2Body = new CANNON.Body({ mass: 0 });
    wall2Body.addShape(wall2Shape);
    wall2Body.position.set(-wallSize / 2, wallHeight / 2, 0);
    world.addBody(wall2Body);

    // Стена 3 (правая)
    const wall3Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallSize);
    const wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
    wall3.position.set(wallSize / 2, wallHeight / 2, 0);
    scene.add(wall3);

    const wall3Shape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, wallSize / 2));
    const wall3Body = new CANNON.Body({ mass: 0 });
    wall3Body.addShape(wall3Shape);
    wall3Body.position.set(wallSize / 2, wallHeight / 2, 0);
    world.addBody(wall3Body);

    // Стена 4 (передняя)
    const wall4Geometry = new THREE.BoxGeometry(wallSize, wallHeight, wallThickness);
    const wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
    wall4.position.set(0, wallHeight / 2, wallSize / 2);
    scene.add(wall4);

    const wall4Shape = new CANNON.Box(new CANNON.Vec3(wallSize / 2, wallHeight / 2, wallThickness / 2));
    const wall4Body = new CANNON.Body({ mass: 0 });
    wall4Body.addShape(wall4Shape);
    wall4Body.position.set(0, wallHeight / 2, wallSize / 2);
    world.addBody(wall4Body);
}

// Создание кубика
function createDice(diceType) {
    const resultElement = document.getElementById('result');
    resultElement.textContent = 'Бросьте кубик';

    // Удаляем предыдущий кубик, если он есть
    if (dice) {
        scene.remove(dice.mesh);
        world.remove(dice.body);
    }

    // Параметры для различных типов кубиков
    const diceParams = {
        'd4': { type: 'tetrahedron', size: 2, values: 4 },
        'd6': { type: 'box', size: 2, values: 6 },
        'd8': { type: 'octahedron', size: 2, values: 8 },
        'd10': { type: 'custom', size: 2, values: 10 },
        'd12': { type: 'dodecahedron', size: 2, values: 12 },
        'd20': { type: 'icosahedron', size: 2, values: 20 }
    };

    const params = diceParams[diceType];
    let diceGeometry, diceShape;

    // Создаем геометрию в зависимости от типа кубика
    switch (params.type) {
        case 'box':
            diceGeometry = new THREE.BoxGeometry(params.size, params.size, params.size);
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
        case 'tetrahedron':
            diceGeometry = new THREE.TetrahedronGeometry(params.size);
            // Упрощенная физическая форма для тетраэдра
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
        case 'octahedron':
            diceGeometry = new THREE.OctahedronGeometry(params.size);
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
        case 'dodecahedron':
            diceGeometry = new THREE.DodecahedronGeometry(params.size);
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
        case 'icosahedron':
            diceGeometry = new THREE.IcosahedronGeometry(params.size);
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
        case 'custom': // D10
            diceGeometry = new THREE.ConeGeometry(params.size, params.size * 1.5, 10);
            diceShape = new CANNON.Box(new CANNON.Vec3(params.size / 2, params.size / 2, params.size / 2));
            break;
    }

    // Создаем материал для кубика
    const textureLoader = new THREE.TextureLoader();
    const diceMaterial = new THREE.MeshStandardMaterial({
        color: 0x7722DD,
        roughness: 0.3,
        metalness: 0.2
    });

    // Создаем сетку для кубика
    const diceMesh = new THREE.Mesh(diceGeometry, diceMaterial);
    diceMesh.castShadow = true;
    diceMesh.receiveShadow = true;
    scene.add(diceMesh);

    // Создаем физическое тело для кубика
    const diceBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0),
        shape: diceShape
    });

    // Добавляем затухание
    diceBody.linearDamping = 0.1;
    diceBody.angularDamping = 0.1;

    world.addBody(diceBody);

    // Сохраняем кубик
    dice = {
        mesh: diceMesh,
        body: diceBody,
        values: params.values,
        type: diceType
    };

    return dice;
}

// Бросок кубика
function rollDice() {
    if (isDiceRolling) return;

    const resultElement = document.getElementById('result');
    resultElement.textContent = '...';

    // Очищаем предыдущий таймаут
    if (resultTimeout) {
        clearTimeout(resultTimeout);
    }

    // Сбрасываем положение кубика
    dice.body.position.set(0, 10, 0);
    dice.body.velocity.set(0, 0, 0);
    dice.body.angularVelocity.set(0, 0, 0);

    // Применяем случайную силу и крутящий момент
    const force = 3 + Math.random() * 5;
    dice.body.applyImpulse(
        new CANNON.Vec3(
            (Math.random() - 0.5) * force,
            force,
            (Math.random() - 0.5) * force
        ),
        new CANNON.Vec3(0, 0, 0)
    );

    dice.body.angularVelocity.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
    );

    isDiceRolling = true;

    // Проверяем результат через 3 секунды
    resultTimeout = setTimeout(() => {
        if (isDiceRolling) {
            const result = getRandomInt(1, dice.values + 1);
            resultElement.textContent = `Результат: ${result}`;
            isDiceRolling = false;
        }
    }, 3000);
}

// Получение случайного целого числа
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Сброс кубика
function resetDice() {
    createDice(lastDiceType);
}

// Обработка изменения размера окна
function onWindowResize() {
    const container = document.getElementById('blazor-dice-container');
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

// Анимация
function animate() {
    requestAnimationFrame(animate);

    // Обновление физики
    world.step(1 / 60);

    // Обновление положения кубика
    if (dice) {
        dice.mesh.position.copy(dice.body.position);
        dice.mesh.quaternion.copy(dice.body.quaternion);

        // Проверка на неподвижность кубика
        const velocity = dice.body.velocity.length();
        const angularVelocity = dice.body.angularVelocity.length();

        if (isDiceRolling && velocity < 0.1 && angularVelocity < 0.1 && dice.body.position.y < 2) {
            isDiceRolling = false;

            // Определение результата
            const result = getRandomInt(1, dice.values + 1);
            document.getElementById('result').textContent = `Результат: ${result}`;
        }
    }

    // Рендеринг сцены
    renderer.render(scene, camera);
}

// Запуск инициализации при загрузке страницы