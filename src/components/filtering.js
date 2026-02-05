export function initFiltering(elements) {
    // Функция для обновления выпадающих списков (вызывается после получения индексов)
    const updateIndexes = (indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            // Проверяем, существует ли элемент в elements
            if (elements[elementName] && elements[elementName].tagName === 'SELECT') {
                // Очищаем существующие опции (кроме первой пустой)
                while (elements[elementName].options.length > 1) {
                    elements[elementName].remove(1);
                }
                
                // Добавляем новые опции из индексов
                Object.values(indexes[elementName]).forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    elements[elementName].appendChild(option);
                });
            }
        });
    };

    // Функция для формирования параметров фильтрации (вызывается до запроса)
    const applyFiltering = (query, state, action) => {
        console.log('🔧 Фильтрация: action =', action?.name, 'field =', action?.dataset?.field);
        
        // Обработка кнопки очистки поля
        if (action && action.name === 'clear') {
            const fieldName = action.dataset.field;
            console.log('🔄 Очистка поля фильтра:', fieldName);
            
            if (fieldName) {
                // Ищем соответствующий элемент фильтра
                let fieldElement;
                
                // Проверяем в elements фильтра по имени
                const elementKeys = Object.keys(elements);
                for (const key of elementKeys) {
                    if (elements[key] && elements[key].name === fieldName) {
                        fieldElement = elements[key];
                        break;
                    }
                }
                
                // Очищаем поле
                if (fieldElement) {
                    fieldElement.value = '';
                    console.log('✅ Поле', fieldName, 'очищено');
                    
                    // Триггерим событие для обновления state
                    fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }

        // Формируем объект фильтров для сервера
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                // Проверяем, что это поле ввода или select с непустым значением
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    // Формируем ключ в формате filter[fieldName] для вложенного объекта в query
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        });

        // Если есть фильтры, добавляем их к запросу
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}