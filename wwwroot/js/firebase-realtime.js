window.firebaseRealtime = {
    // Инициализация Firebase
    initialize: function () {
        console.log("Firebase Realtime initialized");
        // Проверяем соединение
        const connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("Connected to Firebase");
            } else {
                console.log("Disconnected from Firebase");
            }
        });
    },

    // Установка слушателя для персонажа
    listenToCharacter: function (characterId, dotNetRef) {
        console.log(`Start listening to character: ${characterId}`);
        const ref = firebase.database().ref(`characters/${characterId}`);

        // Отписываемся от предыдущего слушателя, если он был
        ref.off('value');

        // Подписываемся на изменения
        ref.on('value', (snapshot) => {
            if (snapshot.exists()) {
                console.log(`Character data received for: ${characterId}`);
                const data = snapshot.val();
                dotNetRef.invokeMethodAsync('OnCharacterUpdate', JSON.stringify(data));
            } else {
                console.log(`No data for character: ${characterId}`);
            }
        });

        return true;
    },

    // Отписка от слушателя для персонажа
    stopListeningToCharacter: function (characterId) {
        console.log(`Stop listening to character: ${characterId}`);
        const ref = firebase.database().ref(`characters/${characterId}`);
        ref.off('value');
        return true;
    },

    // Обновление данных персонажа
    updateCharacter: function (characterId, jsonData) {
        console.log(`Updating character: ${characterId}`);
        const ref = firebase.database().ref(`characters/${characterId}`);

        try {
            const data = JSON.parse(jsonData);
            ref.set(data); // Используем set вместо update для полной перезаписи
            console.log("Update successful");
            return true;
        } catch (error) {
            console.error(`Update error: ${error.message}`);
            return false;
        }
    },

    // Тестирование соединения
    testConnection: function () {
        try {
            const testRef = firebase.database().ref("test");
            testRef.set({
                timestamp: Date.now(),
                message: "Test connection successful"
            });

            console.log("Firebase connection test successful");
            return true;
        } catch (error) {
            console.error("Firebase connection test failed:", error);
            return false;
        }
    },

    // Отладка правил доступа
    debugRules: function () {
        try {
            const testRef = firebase.database().ref("test/debug");
            testRef.once('value')
                .then(() => {
                    console.log("Read permission granted");
                    return testRef.set({ test: true });
                })
                .then(() => {
                    console.log("Write permission granted");
                })
                .catch(error => {
                    console.error("Permission error:", error);
                });
        } catch (error) {
            console.error("Debug error:", error);
        }
    }
};