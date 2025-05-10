//window.setupMouseEvents = (element, dotNetHelper) => {
//    element.addEventListener('mousemove', (e) => {
//        const rect = element.getBoundingClientRect();
//        const x = e.clientX - rect.left;
//        const y = e.clientY - rect.top;
//        dotNetHelper.invokeMethodAsync('UpdateMousePosition', x, y);
//    });
//};

//window.getContainerDimensions = (element) => {
//    const rect = element.getBoundingClientRect();
//    return [rect.width, rect.height];
//};




// Функция для настройки обработчиков событий мыши
window.setupMouseEvents = function (element, dotNetRef) {
    element.addEventListener('mousemove', function (e) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dotNetRef.invokeMethodAsync('UpdateMousePosition', x, y);
    });
};

// Переменные для хранения контекста canvas
let ctx;
let diceImages = {};

// Инициализация canvas
window.initCanvas = function (canvasElement) {
    ctx = canvasElement.getContext('2d');

    // Предзагрузка изображений для костей (можно использовать для текстур)
    preloadDiceImages();
};

// Функция для предзагрузки изображений костей (опционально)
function preloadDiceImages() {
    // Здесь можно загрузить текстуры для разных типов костей, если необходимо
}

// Функция для рисования кости на canvas
window.drawDice = function (canvas, x, y, z, rotX, rotY, rotZ, diceType, result, color, isMoving) {
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем фон и тень
    drawShadow(canvas, x, y, z);

    // Рисуем кость в зависимости от типа
    switch (diceType) {
        case 2:
            drawD2(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
        case 4:
            drawD4(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
        case 6:
            drawD6(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
        case 8:
            drawD8(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
        case 12:
            drawD12(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
        case 20:
            drawD20(x, y, z, rotX, rotY, rotZ, result, color, isMoving);
            break;
    }
};

// Функция для рисования тени кости
function drawShadow(canvas, x, y, z) {
    ctx.save();

    // Рассчитываем размер тени в зависимости от глубины (z)
    const shadowSize = 80 - Math.min(30, Math.max(-30, z / 10));
    const shadowOpacity = Math.max(0.1, Math.min(0.3, 0.3 - z / 1000));

    // Рисуем тень
    ctx.beginPath();
    ctx.ellipse(x + 50, y + 110, shadowSize, shadowSize / 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
    ctx.fill();

    ctx.restore();
}

// Функция для рисования d2 (монеты)
function drawD2(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр монеты
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер монеты
    const radius = 40 * scale;

    // Эллипс для создания 3D эффекта
    const yRadius = radius * Math.abs(Math.cos(rotX * Math.PI / 180));

    ctx.translate(centerX, centerY);
    ctx.rotate(rotZ * Math.PI / 180);

    // Рисуем край монеты
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, yRadius, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700'; // Золотой цвет
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем лицевую сторону монеты
    ctx.beginPath();
    ctx.ellipse(0, 0, radius - 5, yRadius - 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Рисуем значение, если кость не в движении
    if (!isMoving && result) {
        ctx.fillStyle = '#000';
        ctx.font = `${24 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result, 0, 0);
    }

    ctx.restore();
}

// Функция для рисования d4 (тетраэдр)
function drawD4(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр кости
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер кости
    const size = 50 * scale;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotZ % 120) * Math.PI / 180);

    // Рисуем тетраэдр (упрощенно, как треугольник)
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.closePath();

    // Меняем цвет в зависимости от угла поворота для имитации граней
    const colorShade = Math.abs((rotX % 360) / 360);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const shadedColor = `rgb(${Math.floor(r * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(g * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(b * (0.7 + colorShade * 0.3))})`;

    ctx.fillStyle = shadedColor;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем значение, если кость не в движении
    if (!isMoving && result) {
        ctx.fillStyle = '#000';
        ctx.font = `${24 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result, 0, 0);
    }

    ctx.restore();
}

// Функция для рисования d6 (куб)
function drawD6(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр кости
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер кости
    const size = 40 * scale;

    // Определение смещений для создания 3D эффекта куба
    const angles = {
        x: rotX * Math.PI / 180,
        y: rotY * Math.PI / 180,
        z: rotZ * Math.PI / 180
    };

    // Простое 3D-преобразование для точек куба
    const points = [
        { x: -size, y: -size, z: -size },
        { x: size, y: -size, z: -size },
        { x: size, y: size, z: -size },
        { x: -size, y: size, z: -size },
        { x: -size, y: -size, z: size },
        { x: size, y: -size, z: size },
        { x: size, y: size, z: size },
        { x: -size, y: size, z: size }
    ];

    // Применяем вращение
    const rotatedPoints = points.map(point => {
        // Вращение вокруг оси X
        let y1 = point.y * Math.cos(angles.x) - point.z * Math.sin(angles.x);
        let z1 = point.y * Math.sin(angles.x) + point.z * Math.cos(angles.x);

        // Вращение вокруг оси Y
        let x2 = point.x * Math.cos(angles.y) + z1 * Math.sin(angles.y);
        let z2 = -point.x * Math.sin(angles.y) + z1 * Math.cos(angles.y);

        // Вращение вокруг оси Z
        let x3 = x2 * Math.cos(angles.z) - y1 * Math.sin(angles.z);
        let y3 = x2 * Math.sin(angles.z) + y1 * Math.cos(angles.z);

        return { x: x3, y: y3, z: z2 };
    });

    // Определяем видимые грани (упрощенно)
    const faces = [
        [0, 1, 2, 3], // Передняя грань
        [4, 5, 6, 7], // Задняя грань
        [0, 1, 5, 4], // Верхняя грань
        [2, 3, 7, 6], // Нижняя грань
        [0, 3, 7, 4], // Левая грань
        [1, 2, 6, 5]  // Правая грань
    ];

    // Определяем видимость граней (очень упрощенно)
    const visibleFaces = faces.map(face => {
        const p1 = rotatedPoints[face[0]];
        const p2 = rotatedPoints[face[1]];
        const p3 = rotatedPoints[face[2]];

        // Вычисляем нормаль для определения видимости грани
        const normal = {
            x: (p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y),
            y: (p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z),
            z: (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
        };

        // Если произведение нормали и вектора к наблюдателю отрицательное, грань видима
        return normal.z < 0;
    });

    // Сортируем грани по глубине (для правильного порядка отрисовки)
    const faceDepths = faces.map((face, index) => {
        const avgZ = (rotatedPoints[face[0]].z +
            rotatedPoints[face[1]].z +
            rotatedPoints[face[2]].z +
            rotatedPoints[face[3]].z) / 4;
        return { index, avgZ, visible: visibleFaces[index] };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Рисуем видимые грани в порядке от дальней к ближней
    ctx.translate(centerX, centerY);

    for (const faceData of faceDepths) {
        if (!faceData.visible) continue;

        const face = faces[faceData.index];
        const faceValue = faceData.index + 1; // Число на грани (1-6)

        ctx.beginPath();
        ctx.moveTo(rotatedPoints[face[0]].x, rotatedPoints[face[0]].y);
        ctx.lineTo(rotatedPoints[face[1]].x, rotatedPoints[face[1]].y);
        ctx.lineTo(rotatedPoints[face[2]].x, rotatedPoints[face[2]].y);
        ctx.lineTo(rotatedPoints[face[3]].x, rotatedPoints[face[3]].y);
        ctx.closePath();

        // Затеняем грани в зависимости от ориентации
        const shading = 0.6 + 0.4 * (1 - Math.abs(faceData.avgZ) / size);
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const shadedColor = `rgb(${Math.floor(r * shading)}, 
                               ${Math.floor(g * shading)}, 
                               ${Math.floor(b * shading)})`;

        ctx.fillStyle = shadedColor;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Рисуем число на грани, если кость не в движении
        if (!isMoving) {
            // Центр грани
            const centerFaceX = (rotatedPoints[face[0]].x +
                rotatedPoints[face[1]].x +
                rotatedPoints[face[2]].x +
                rotatedPoints[face[3]].x) / 4;
            const centerFaceY = (rotatedPoints[face[0]].y +
                rotatedPoints[face[1]].y +
                rotatedPoints[face[2]].y +
                rotatedPoints[face[3]].y) / 4;

            // Рисуем нужное число в зависимости от грани и результата
            if (result === faceValue) {
                ctx.fillStyle = '#000';
                ctx.font = `bold ${18 * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(faceValue.toString(), centerFaceX, centerFaceY);
            } else {
                // Для других граней рисуем точки, как на обычном кубике
                drawDiceDots(centerFaceX, centerFaceY, faceValue, shading, scale);
            }
        }
    }

    ctx.restore();
}

// Функция для рисования точек на кубике
function drawDiceDots(x, y, value, shading, scale) {
    ctx.fillStyle = `rgba(0, 0, 0, ${shading})`;
    const dotSize = 4 * scale;
    const offset = 10 * scale;

    switch (value) {
        case 1:
            drawDot(x, y, dotSize);
            break;
        case 2:
            drawDot(x - offset, y - offset, dotSize);
            drawDot(x + offset, y + offset, dotSize);
            break;
        case 3:
            drawDot(x - offset, y - offset, dotSize);
            drawDot(x, y, dotSize);
            drawDot(x + offset, y + offset, dotSize);
            break;
        case 4:
            drawDot(x - offset, y - offset, dotSize);
            drawDot(x + offset, y - offset, dotSize);
            drawDot(x - offset, y + offset, dotSize);
            drawDot(x + offset, y + offset, dotSize);
            break;
        case 5:
            drawDot(x - offset, y - offset, dotSize);
            drawDot(x + offset, y - offset, dotSize);
            drawDot(x, y, dotSize);
            drawDot(x - offset, y + offset, dotSize);
            drawDot(x + offset, y + offset, dotSize);
            break;
        case 6:
            drawDot(x - offset, y - offset, dotSize);
            drawDot(x + offset, y - offset, dotSize);
            drawDot(x - offset, y, dotSize);
            drawDot(x + offset, y, dotSize);
            drawDot(x - offset, y + offset, dotSize);
            drawDot(x + offset, y + offset, dotSize);
            break;
    }
}

function drawDot(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Функция для рисования d8 (октаэдр)
function drawD8(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр кости
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер кости
    const size = 40 * scale;

    ctx.translate(centerX, centerY);
    ctx.rotate(rotZ * Math.PI / 180);

    // Рисуем октаэдр (упрощенно, как два соединенных основаниями пирамиды)
    ctx.beginPath();

    // Верхняя пирамида
    ctx.moveTo(0, -size);
    ctx.lineTo(-size * 0.7, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(size * 0.7, 0);
    ctx.closePath();

    // Меняем цвет в зависимости от угла поворота для имитации граней
    const colorShade = Math.abs(((rotX + rotY) % 360) / 360);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const shadedColor = `rgb(${Math.floor(r * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(g * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(b * (0.7 + colorShade * 0.3))})`;

    ctx.fillStyle = shadedColor;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Боковая проекция (для создания 3D эффекта)
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, 0);
    ctx.lineTo(0, size * 0.7);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, -size * 0.7);
    ctx.closePath();

    const shadowColor = `rgb(${Math.floor(r * 0.6)}, 
                           ${Math.floor(g * 0.6)}, 
                           ${Math.floor(b * 0.6)})`;
    ctx.fillStyle = shadowColor;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.stroke();

    // Рисуем значение, если кость не в движении
    if (!isMoving && result) {
        ctx.fillStyle = '#000';
        ctx.font = `${22 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result, 0, 0);
    }

    ctx.restore();
}

// Функция для рисования d12 (додекаэдр)
function drawD12(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр кости
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер кости
    const size = 40 * scale;

    ctx.translate(centerX, centerY);

    // Создаем упрощенное представление додекаэдра как пятиугольника с выделенными гранями
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) + (rotZ * Math.PI / 180);
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Меняем цвет в зависимости от угла поворота для имитации граней
    const colorShade = Math.abs(((rotX + rotY) % 360) / 360);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const shadedColor = `rgb(${Math.floor(r * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(g * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(b * (0.7 + colorShade * 0.3))})`;

    ctx.fillStyle = shadedColor;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Внутренний пятиугольник для создания эффекта граней
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) + (rotZ * Math.PI / 180) + Math.PI / 5;
        const x = size * 0.7 * Math.cos(angle);
        const y = size * 0.7 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const innerColor = `rgb(${Math.floor(r * 0.85)}, 
                           ${Math.floor(g * 0.85)}, 
                           ${Math.floor(b * 0.85)})`;
    ctx.fillStyle = innerColor;
    ctx.fill();
    ctx.stroke();

    // Рисуем значение, если кость не в движении
    if (!isMoving && result) {
        ctx.fillStyle = '#000';
        ctx.font = `${20 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result, 0, 0);
    }

    ctx.restore();
}

// Функция для рисования d20 (икосаэдр)
function drawD20(x, y, z, rotX, rotY, rotZ, result, color, isMoving) {
    ctx.save();

    // Центр кости
    const centerX = x + 50;
    const centerY = y + 50;

    // Масштаб в зависимости от глубины
    const scale = Math.max(0.5, 1 - z / 1000);

    // Размер кости
    const size = 45 * scale;

    ctx.translate(centerX, centerY);

    // Создаем упрощенное представление икосаэдра как треугольника с дополнительными гранями
    const angle1 = rotZ * Math.PI / 180;
    const angle2 = angle1 + (2 * Math.PI / 3);
    const angle3 = angle1 + (4 * Math.PI / 3);

    // Основной треугольник
    ctx.beginPath();
    ctx.moveTo(size * Math.cos(angle1), size * Math.sin(angle1));
    ctx.lineTo(size * Math.cos(angle2), size * Math.sin(angle2));
    ctx.lineTo(size * Math.cos(angle3), size * Math.sin(angle3));
    ctx.closePath();

    // Меняем цвет в зависимости от угла поворота для имитации граней
    const colorShade = Math.abs(((rotX + rotY) % 360) / 360);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const shadedColor = `rgb(${Math.floor(r * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(g * (0.7 + colorShade * 0.3))}, 
                             ${Math.floor(b * (0.7 + colorShade * 0.3))})`;

    ctx.fillStyle = shadedColor;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем внутреннюю структуру для создания эффекта граней
    const innerSize = size * 0.6;

    ctx.beginPath();
    ctx.moveTo(innerSize * Math.cos(angle1), innerSize * Math.sin(angle1));
    ctx.lineTo(innerSize * Math.cos(angle2), innerSize * Math.sin(angle2));
    ctx.lineTo(innerSize * Math.cos(angle3), innerSize * Math.sin(angle3));
    ctx.closePath();

    const innerColor = `rgb(${Math.floor(r * 0.85)}, 
                           ${Math.floor(g * 0.85)}, 
                           ${Math.floor(b * 0.85)})`;
    ctx.fillStyle = innerColor;
    ctx.fill();
    ctx.stroke();

    // Центральный треугольник
    const centerSize = size * 0.3;

    ctx.beginPath();
    ctx.moveTo(centerSize * Math.cos(angle1 + Math.PI), centerSize * Math.sin(angle1 + Math.PI));
    ctx.lineTo(centerSize * Math.cos(angle2 + Math.PI), centerSize * Math.sin(angle2 + Math.PI));
    ctx.lineTo(centerSize * Math.cos(angle3 + Math.PI), centerSize * Math.sin(angle3 + Math.PI));
    ctx.closePath();

    const centerColor = `rgb(${Math.floor(r * 0.7)}, 
                            ${Math.floor(g * 0.7)}, 
                            ${Math.floor(b * 0.7)})`;
    ctx.fillStyle = centerColor;
    ctx.fill();
    ctx.stroke();

    // Рисуем значение, если кость не в движении
    if (!isMoving && result) {
        ctx.fillStyle = '#000';
        ctx.font = `${18 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(result, 0, 0);
    }

    ctx.restore();
}