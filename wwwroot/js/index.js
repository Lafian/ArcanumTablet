window.initializeImageDragDrop = (dropZoneId, dotNetHelper) => {
    const dropZone = document.getElementById(dropZoneId);

    if (!dropZone) {
        console.error(`Элемент с ID ${dropZoneId} не найден`);
        return;
    }

    // Предотвращаем стандартное поведение перетаскивания
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // События для предотвращения стандартного поведения
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    // Подсветка при перетаскивании
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('highlight');
        }, false);
    });

    // Обработка перетаскивания изображения
    dropZone.addEventListener('drop', (e) => {
        // Пробуем получить URL изображения разными способами
        let imageUrl = null;

        // Метод 1: Проверяем наличие ссылки в перетаскиваемых данных
        if (e.dataTransfer.types.includes('text/uri-list')) {
            imageUrl = e.dataTransfer.getData('text/uri-list');
        }
        // Метод 2: Проверяем обычный текст (может содержать URL)
        else if (e.dataTransfer.types.includes('text/plain')) {
            const text = e.dataTransfer.getData('text/plain');
            if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                imageUrl = text;
            }
        }
        // Метод 3: Проверяем наличие HTML (для изображений с веб-страниц)
        else if (e.dataTransfer.types.includes('text/html')) {
            const html = e.dataTransfer.getData('text/html');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
                imageUrl = img.src;
            }
        }

        // Если нашли URL изображения, передаем его в .NET
        if (imageUrl) {
            dotNetHelper.invokeMethodAsync('SetImageUrl', imageUrl);
        }
    }, false);
};


window.exportToPng = function (elementId, fileName) {
    // Создаем динамически скрипт для html2canvas, если он еще не загружен
    if (!window.html2canvas) {
        var script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = function () {
            captureAndDownload(elementId, fileName);
        };
        document.head.appendChild(script);
    } else {
        captureAndDownload(elementId, fileName);
    }

    function captureAndDownload(elementId, fileName) {
        var element = document.getElementById(elementId);

        html2canvas(element, {
            scale: 2, // Масштаб для лучшего качества
            useCORS: true,
            backgroundColor: null,
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        }).then(function (canvas) {
            // Создаем ссылку для скачивания
            var link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
};